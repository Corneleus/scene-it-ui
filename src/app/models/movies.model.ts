// src/app/models/movies.model.ts
// TypeScript interface representing the Movie model from the backend
// This mirrors the backend Movie class so Angular can type-check API data

export interface Movie {
  movieId: number;        // Primary key
  title: string;          // Required title
  year?: string | null;   // Nullable year
  rated?: string | null;  // Nullable rating
  released?: string | null; // Nullable release date as ISO string
  runtime?: string | null; // Nullable runtime
  genre?: string | null;   // Nullable genre
  director?: string | null; // Nullable director
  writer?: string | null;  // Nullable writer
  actors?: string | null;  // Nullable actors
  plot?: string | null;    // Nullable plot
  language?: string | null; // Nullable language
  country?: string | null;  // Nullable country
  awards?: string | null;   // Nullable awards
  poster?: string | null;   // Nullable poster URL
  metascore?: string | null; // Nullable metascore
  imdbRating?: string | null; // Nullable IMDB rating
  imdbId: string;           // Required IMDB ID
  type?: string | null;     // Nullable type (movie, series, etc.)
  dvd?: string | null;      // Nullable DVD release date
  boxOffice?: string | null; // Nullable box office earnings
  production?: string | null; // Nullable production company
}
