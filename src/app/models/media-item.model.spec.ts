import { normalizeMediaKind, normalizePosterUrl } from './media-item.model';

describe('media-item.model', () => {
  it.each([
    ['movie', 'movie'],
    ['series', 'series'],
    ['tvSeries', 'series'],
    ['tvMiniSeries', 'series'],
    ['miniSeries', 'series'],
    ['videoGame', 'videoGame'],
    ['video-game', 'videoGame'],
    ['game', 'videoGame'],
    ['unknown', null],
    [null, null],
  ])('normalizes %s to %s', (type, expected) => {
    expect(normalizeMediaKind(type)).toBe(expected);
  });

  it.each([
    ['N/A', null],
    ['  ', null],
    ['//m.media-amazon.com/images/M/example.jpg', 'https://m.media-amazon.com/images/M/example.jpg'],
    ['m.media-amazon.com/images/M/example.jpg', 'https://m.media-amazon.com/images/M/example.jpg'],
    ['MV5Bexample.jpg', 'https://m.media-amazon.com/images/M/MV5Bexample.jpg'],
    ['https://image.test/poster.jpg', 'https://image.test/poster.jpg'],
  ])('normalizes poster value %s', (poster, expected) => {
    expect(normalizePosterUrl(poster)).toBe(expected);
  });
});
