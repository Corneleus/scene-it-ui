import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ImportQueueItem,
  ImportRunResult,
  QueueImportItem,
  QueueImportResult,
} from '../../models/imports.model';

@Injectable({
  providedIn: 'root',
})
export class ImportsService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Imports`;

  constructor(private http: HttpClient) {}

  getQueue(): Observable<ImportQueueItem[]> {
    return this.http
      .get<ImportQueueItem[]>(`${this.apiUrl}/queue`)
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'Unable to load import queue.')));
  }

  queueItems(items: QueueImportItem[]): Observable<QueueImportResult> {
    return this.http
      .post<QueueImportResult>(`${this.apiUrl}/queue`, { items })
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'Unable to queue imports.')));
  }

  runImport(maxCount: number): Observable<ImportRunResult> {
    return this.http
      .post<ImportRunResult>(`${this.apiUrl}/run`, { maxCount })
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'Unable to run import batch.')));
  }

  getRuns(): Observable<ImportRunResult[]> {
    return this.http
      .get<ImportRunResult[]>(`${this.apiUrl}/runs`)
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'Unable to load import runs.')));
  }

  private mapApiError(error: unknown, fallbackMessage: string) {
    if (error instanceof HttpErrorResponse) {
      const detail =
        typeof error.error === 'string'
          ? error.error
          : error.error?.detail || error.error?.title || fallbackMessage;

      return throwError(() => new Error(detail));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error(fallbackMessage));
  }
}
