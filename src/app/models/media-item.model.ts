export type MediaKind = 'movie' | 'series' | 'videoGame';

export interface MediaItem {
  mediaItemId: number;
  movieId?: number;
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

type MediaItemIdentifier = {
  mediaItemId?: number;
  movieId?: number;
};

export function withLegacyMovieId<T extends MediaItemIdentifier>(mediaItem: T): T & MediaItem {
  const mediaItemId = mediaItem.mediaItemId ?? mediaItem.movieId ?? 0;

  return {
    ...mediaItem,
    mediaItemId,
    movieId: mediaItemId,
    poster: normalizePosterUrl((mediaItem as { poster?: string | null }).poster),
  } as T & MediaItem;
}

export function normalizeMediaKind(type: string | null | undefined): MediaKind | null {
  const normalizedType = normalizeKindToken(type);

  if (normalizedType === 'movie') {
    return 'movie';
  }

  if (normalizedType === 'videogame' || normalizedType === 'game') {
    return 'videoGame';
  }

  if (normalizedType === 'series' || normalizedType === 'tvseries' || normalizedType === 'tvminiseries' || normalizedType === 'miniseries') {
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
