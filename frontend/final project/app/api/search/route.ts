import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = 'https://movie-recommendation-api-pc9g.onrender.com';
const OMDB_API_KEY = '91302802';
const OMDB_API_URL = 'https://www.omdbapi.com/';

// Convert MovieLens format -> normal title
function parseMovieLensTitle(fullTitle: string) {
  const match = fullTitle.match(/^(.+?)\s\((\d{4})\)$/);

  if (!match) return { title: fullTitle, year: '' };

  let title = match[1].trim();
  const year = match[2];

  if (title.endsWith(", The")) title = "The " + title.replace(", The", "");
  if (title.endsWith(", A")) title = "A " + title.replace(", A", "");
  if (title.endsWith(", An")) title = "An " + title.replace(", An", "");

  return { title, year };
}

async function fetchOmdbMovie(title: string, year: string) {
  try {
    const response = await fetch(
      `${OMDB_API_URL}?t=${encodeURIComponent(title)}&y=${year}&apikey=${OMDB_API_KEY}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.Response === "True") return data;

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ movies: [] });
  }

  try {
    // Step 1: get recommendations from FastAPI
    const res = await fetch(
      `${FASTAPI_URL}/recommend?movie=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    const titles: string[] = data.recommendations || [];

    // Step 2: enrich with OMDb
    const movies = await Promise.all(
      titles.map(async (fullTitle) => {
        const { title, year } = parseMovieLensTitle(fullTitle);

        const omdb = await fetchOmdbMovie(title, year);

        if (omdb) {
          return {
            id: omdb.imdbID,
            title: omdb.Title,
            year: omdb.Year,
            rating: omdb.imdbRating,
            poster: omdb.Poster !== 'N/A' ? omdb.Poster : null
          };
        }

        // fallback if OMDb fails
        return {
          id: fullTitle,
          title: title,
          year: year,
          rating: '',
          poster: null
        };
      })
    );

    return NextResponse.json({ movies });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ movies: [] });
  }
}
