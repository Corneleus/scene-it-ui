export interface ImportQueueItem {
  importQueueId: number;
  imdbId: string;
  title: string | null;
  year: string | null;
  rated: string | null;
  runtime: string | null;
  genre: string | null;
  director: string | null;
  writer: string | null;
  actors: string | null;
  plot: string | null;
  language: string | null;
  country: string | null;
  awards: string | null;
  poster: string | null;
  metascore: string | null;
  imdbRating: string | null;
  imdbVotes: string | null;
  type: string | null;
  dvd: string | null;
  boxOffice: string | null;
  production: string | null;
  status: string;
  attemptCount: number;
  lastAttemptedAtUtc: string | null;
  importedAtUtc: string | null;
  errorMessage: string | null;
}

export interface ImportRunResult {
  importRunId: number;
  startedAtUtc: string;
  completedAtUtc: string | null;
  requestedLimit: number;
  attemptedCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  notes: string | null;
}

export interface QueueImportItem {
  imdbId: string;
  title: string | null;
}

export interface QueueImportResult {
  queuedCount: number;
  skippedCount: number;
  queuedItems: ImportQueueItem[];
}
