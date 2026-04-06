export type MediaKind = 'movie' | 'series' | 'videoGame';

const MOVIE_KIND_TOKENS = ['movie'] as const;
const SERIES_KIND_TOKENS = ['series', 'tvseries', 'tvminiseries', 'miniseries'] as const;
const VIDEO_GAME_KIND_TOKENS = ['videogame', 'game'] as const;

export interface MediaItem {
  mediaItemId: number;
  title: string;
  year?: string | null;
  rated?: string | null;
  released?: string | null;
  runtime?: string | null;
  genre?: string | null;
  director?: string | null;
  writer?: string | null;
  actors?: string | null;
  plot?: string | null;
  language?: string | null;
  country?: string | null;
  awards?: string | null;
  poster?: string | null;
  metascore?: string | null;
  imdbRating?: string | null;
  imdbVotes?: string | null;
  imdbId: string;
  type?: string | null;
  dvd?: string | null;
  boxOffice?: string | null;
  production?: string | null;
}

export function normalizeMediaItem<T extends { poster?: string | null }>(mediaItem: T): T {
  return {
    ...mediaItem,
    poster: normalizePosterUrl(mediaItem.poster),
  };
}

export function normalizeMediaKind(type: string | null | undefined): MediaKind | null {
  const normalizedType = normalizeKindToken(type);

  if (MOVIE_KIND_TOKENS.includes(normalizedType as (typeof MOVIE_KIND_TOKENS)[number])) {
    return 'movie';
  }

  if (VIDEO_GAME_KIND_TOKENS.includes(normalizedType as (typeof VIDEO_GAME_KIND_TOKENS)[number])) {
    return 'videoGame';
  }

  if (SERIES_KIND_TOKENS.includes(normalizedType as (typeof SERIES_KIND_TOKENS)[number])) {
    return 'series';
  }

  return null;
}

function normalizeKindToken(type: string | null | undefined): string {
  return (type ?? '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .toLowerCase();
}

export function normalizePosterUrl(poster: string | null | undefined): string | null {
  if (!poster) {
    return null;
  }

  const trimmedPoster = poster.trim();

  if (!trimmedPoster || trimmedPoster.toUpperCase() === 'N/A') {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedPoster)) {
    return trimmedPoster;
  }

  if (trimmedPoster.startsWith('//')) {
    return `https:${trimmedPoster}`;
  }

  if (trimmedPoster.startsWith('m.media-amazon.com/')) {
    return `https://${trimmedPoster}`;
  }

  if (/^MV5.*\.(jpg|jpeg|png)$/i.test(trimmedPoster)) {
    return `https://m.media-amazon.com/images/M/${trimmedPoster}`;
  }

  return trimmedPoster;
}
