import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MediaItem, MediaKind } from '../../../models/media-item.model';
import { AddMediaItemComponent } from '../add-media-item/add-media-item';
import { MediaItemDetailsModalComponent } from '../media-item-details-modal/media-item-details-modal.component';
import { MediaItemTableComponent } from '../media-item-table/media-item-table.component';
import { MediaLibraryService } from '../media-library.service';

@Component({
  selector: 'app-media-library-page',
  standalone: true,
  imports: [CommonModule, AddMediaItemComponent, MediaItemDetailsModalComponent, MediaItemTableComponent],
  templateUrl: './media-library.page.html',
  styleUrl: './media-library.page.scss',
})
export class MediaLibraryPageComponent implements OnInit {
  private readonly mediaLibraryService = inject(MediaLibraryService);

  kind = input.required<MediaKind>();
  heroTitle = input.required<string>();
  heroCopy = input.required<string>();
  panelTitle = input.required<string>();
  triggerLabel = input.required<string>();
  itemLabel = input.required<string>();
  itemLabelPlural = input.required<string>();
  deleteItemLabel = input.required<string>();
  deleteItemLabelPlural = input.required<string>();
  detailTitle = input.required<string>();
  searchLabel = input.required<string>();
  selectedLabel = input.required<string>();
  loadErrorMessage = input.required<string>();
  selectionStatusMessage = input.required<string>();
  softDeleteErrorMessage = input.required<string>();
  hardDeleteErrorMessage = input.required<string>();

  readonly items = signal<MediaItem[]>([]);
  readonly loading = signal(true);
  readonly deleteInProgress = signal(false);
  readonly feedbackMessage = signal('');
  readonly feedbackTone = signal<'success' | 'error'>('success');
  readonly detailsItem = signal<MediaItem | null>(null);
  readonly loadedCountText = computed(() => `${this.items().length} titles currently loaded`);

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loading.set(true);
    this.mediaLibraryService.listItems(this.kind()).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.setFeedback(this.loadErrorMessage(), 'error');
        this.loading.set(false);
      },
    });
  }

  handleMediaItemAdded(title: string): void {
    this.setFeedback(`${title} was added to your library.`, 'success');
    this.fetchItems();
  }

  softDeleteItems(ids: number[]): void {
    this.runDeleteRequest(
      ids,
      (id) => this.mediaLibraryService.softDeleteItem(id),
      this.softDeleteErrorMessage(),
      `${ids.length} ${ids.length === 1 ? this.deleteItemLabel() : this.deleteItemLabelPlural()} soft deleted.`,
    );
  }

  hardDeleteItems(ids: number[]): void {
    const deleteTarget = ids.length === 1 ? this.deleteItemLabel() : this.deleteItemLabelPlural();
    const confirmed = window.confirm(
      `Permanently delete ${ids.length} selected ${deleteTarget}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.runDeleteRequest(
      ids,
      (id) => this.mediaLibraryService.hardDeleteItem(id),
      this.hardDeleteErrorMessage(),
      `${ids.length} ${deleteTarget} permanently deleted.`,
    );
  }

  showDetails(item: MediaItem): void {
    this.detailsItem.set(item);
  }

  closeDetails(): void {
    this.detailsItem.set(null);
  }

  private runDeleteRequest(
    ids: number[],
    deleteRequest: (id: number) => ReturnType<MediaLibraryService['softDeleteItem']>,
    errorMessage: string,
    successMessage: string,
  ): void {
    if (ids.length === 0 || this.deleteInProgress()) {
      return;
    }

    this.deleteInProgress.set(true);
    this.feedbackMessage.set('');

    forkJoin(ids.map((id) => deleteRequest(id))).subscribe({
      next: () => {
        this.deleteInProgress.set(false);
        this.setFeedback(successMessage, 'success');
        this.fetchItems();
      },
      error: () => {
        this.setFeedback(errorMessage, 'error');
        this.deleteInProgress.set(false);
      },
    });
  }

  private setFeedback(message: string, tone: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackTone.set(tone);
  }
}
