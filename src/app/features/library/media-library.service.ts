import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediaItem, MediaKind, normalizeMediaItem } from '../../models/media-item.model';

@Injectable({
  providedIn: 'root',
})
export class MediaLibraryService {
  private readonly apiUrl = `${environment.apiBaseUrl}/MediaItems`;

  constructor(private readonly http: HttpClient) {}

  listItems(kind?: MediaKind): Observable<MediaItem[]> {
    return this.http
      .get<MediaItem[]>(this.apiUrl, {
        params: kind ? { kind } : {},
      })
      .pipe(map((items) => items.map(normalizeMediaItem)));
  }

  addItem(item: MediaItem): Observable<MediaItem> {
    return this.http.post<MediaItem>(this.apiUrl, item).pipe(map(normalizeMediaItem));
  }

  softDeleteItem(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  hardDeleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchCatalog(query: string, kind?: MediaKind): Observable<MediaItem[]> {
    return this.http
      .get<MediaItem[]>(`${this.apiUrl}/search`, {
        params: kind ? { query, kind } : { query },
      })
      .pipe(map((items) => items.map(normalizeMediaItem)))
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'OMDb search failed.')));
  }

  lookupByImdbId(id: string): Observable<MediaItem> {
    return this.http
      .get<MediaItem>(`${this.apiUrl}/lookup/${encodeURIComponent(id)}`)
      .pipe(map(normalizeMediaItem))
      .pipe(catchError((error: unknown) => this.mapApiError(error, 'OMDb lookup failed.')));
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
