export const FALLBACK_POSTER_SRC = '/images/poster-not-found.svg';

export function replaceBrokenPoster(event: Event, fallbackSrc = FALLBACK_POSTER_SRC): void {
  const image = event.target as HTMLImageElement | null;

  if (!image || image.dataset.fallbackApplied === 'true') {
    return;
  }

  image.dataset.fallbackApplied = 'true';
  image.src = fallbackSrc;
}
