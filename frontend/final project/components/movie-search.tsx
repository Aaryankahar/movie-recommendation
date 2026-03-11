'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MovieCard } from './movie-card';

interface Movie {
  id: string;
  title: string;
  year: string;
  rating?: string;
  poster: string | null;
}

export function MovieSearch() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setHasSearched(true);

    if (!query.trim()) {
      setError('Please enter a movie title to search');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search movies');
      }

      if (data.movies.length === 0) {
        setError(`No movies found for "${query}"`);
        setMovies([]);
      } else {
        setMovies(data.movies);
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-2 text-neutral-100">
            Discover Your Next Favorite Movie
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search for a movie..."
              value={query}
              onChange={handleInputChange}
              className="pl-10 bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {hasSearched && movies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-neutral-100 mb-4">
            Recommended for you: {movies.length} movie{movies.length !== 1 ? 's' : ''}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>
      )}

      {!hasSearched && movies.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-300 mb-2">
            Get Started
          </h3>
          <p className="text-neutral-500">
            Search for a movie you like to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
}
