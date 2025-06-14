import React from 'react';
import type { Movie } from '../types/movie';

interface MovieResultsProps {
  movies: Movie[];
}

const MovieResults: React.FC<MovieResultsProps> = ({ movies }) => {
  if (!movies.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Results:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h4 className="text-xl font-bold mb-2">{movie.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Year:</span> {movie.year}
              </p>
              <p>
                <span className="font-semibold">Director(s):</span>{' '}
                {(movie.directors || []).join(', ')}
              </p>
              <p>
                <span className="font-semibold">Cast:</span>{' '}
                {(movie.cast || []).slice(0, 3).join(', ')}
                {(movie.cast || []).length > 3 ? '...' : ''}
              </p>
              <p>
                <span className="font-semibold">Genre(s):</span>{' '}
                {(movie.genres || []).join(', ')}
              </p>
              <p>
                <span className="font-semibold">IMDB Rating:</span>{' '}
                {movie.imdb?.rating || 'N/A'}/10 ({movie.imdb?.votes || 0} votes)
              </p>
              <p className="line-clamp-3">
                <span className="font-semibold">Plot:</span> {movie.plot}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieResults; 