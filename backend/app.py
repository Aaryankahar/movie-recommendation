import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load datasets
movies = pd.read_csv("backend/movies.csv")
tags = pd.read_csv("backend/tags.csv")

# Merge tags with movies
tags_grouped = tags.groupby('movieId')['tag'].apply(lambda x: ' '.join(x)).reset_index()
movies = movies.merge(tags_grouped, on='movieId', how='left')

# Fill missing tags
movies['tag'] = movies['tag'].fillna('')

# Combine features
movies['combined_features'] = movies['tag'] + " " + movies['genres']

# Create TF-IDF model
tfid = TfidfVectorizer(stop_words="english")

# Create movie index
indices = pd.Series(movies.index, index=movies['title']).drop_duplicates()

# Recommendation function
def recommend_movies(title):

    matches = [m for m in indices.index if title.lower() in m.lower()]

    if not matches:
        return ["Movie not found"]

    idx = indices[matches[0]]

    # Create TF-IDF matrix
    tfid_matrix = tfid.fit_transform(movies['combined_features'])

    # Compute similarity
    cosine_sim = cosine_similarity(tfid_matrix[idx], tfid_matrix)

    # Get similarity scores
    sim_scores = list(enumerate(cosine_sim[0]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:11]

    movie_indices = [i[0] for i in sim_scores]

    return movies['title'].iloc[movie_indices].tolist()


# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def home():
    return {"message": "Movie Recommendation API running"}

# Recommendation endpoint
@app.get("/recommend")
def get_recommendations(movie: str):

    recommendations = recommend_movies(movie)

    return {
        "movie": movie,
        "recommendations": recommendations
    }
