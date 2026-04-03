export interface ImportQueueItem {
  importQueueId: number;
  imdbId: string;
  title: string | null;
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
