import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaItem } from '../../../models/media-item.model';

type SortColumn = 'title' | 'genre' | 'year' | 'rated';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-media-item-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-item-table.component.html',
  styleUrls: ['./media-item-table.component.scss']
})
export class MediaItemTableComponent {
  private static readonly pageSize = 15;

  items = input<MediaItem[]>([]);
  deleting = input(false);
  searchLabel = input('Search media items');
  itemLabelPlural = input('media items');
  selectedLabel = input('Selected Media Items');
  searchQuery = signal('');
  sortColumn = signal<SortColumn>('title');
  sortDirection = signal<SortDirection>('asc');
  currentPage = signal(0);
  softDeleteRequested = output<number[]>();
  hardDeleteRequested = output<number[]>();
  detailsRequested = output<MediaItem>();

  selectedMediaItemIds = signal<Set<number>>(new Set());

  constructor() {
    effect(() => {
      const itemIds = new Set(this.items().map((item) => item.mediaItemId));
      const selectedIds = this.selectedMediaItemIds();
      const nextSelectedIds = new Set([...selectedIds].filter((id) => itemIds.has(id)));

      if (nextSelectedIds.size !== selectedIds.size) {
        this.selectedMediaItemIds.set(nextSelectedIds);
      }
    });

    effect(() => {
      const lastPage = Math.max(0, Math.ceil(this.sortedItems().length / MediaItemTableComponent.pageSize) - 1);
      const currentPage = this.currentPage();

      if (currentPage > lastPage) {
        this.currentPage.set(lastPage);
      }
    });
  }

  filteredItems = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();

    if (!query) {
      return this.items();
    }

    return this.items().filter((item) =>
      [
        item.title,
        item.genre,
        item.year,
        item.rated,
        item.imdbId,
      ].some((value) => (value ?? '').toString().toLocaleLowerCase().includes(query))
    );
  });

  sortedItems = computed(() => {
    const column = this.sortColumn();
    const direction = this.sortDirection();
    const directionMultiplier = direction === 'asc' ? 1 : -1;

    return [...this.filteredItems()].sort((left, right) => {
      const leftValue = this.getSortableValue(left, column);
      const rightValue = this.getSortableValue(right, column);

      if (leftValue < rightValue) {
        return -1 * directionMultiplier;
      }

      if (leftValue > rightValue) {
        return 1 * directionMultiplier;
      }

      return 0;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedItems().length / MediaItemTableComponent.pageSize))
  );

  pagedItems = computed(() => {
    const start = this.currentPage() * MediaItemTableComponent.pageSize;
    return this.sortedItems().slice(start, start + MediaItemTableComponent.pageSize);
  });

  selectedItems = computed(() =>
    this.items().filter((item) => this.selectedMediaItemIds().has(item.mediaItemId))
  );

  toggleSelection(item: MediaItem): void {
    this.selectedMediaItemIds.update(current => {
      const updated = new Set(current);
      if (updated.has(item.mediaItemId)) {
        updated.delete(item.mediaItemId);
      } else {
        updated.add(item.mediaItemId);
      }
      return updated;
    });
  }

  isSelected(item: MediaItem): boolean {
    return this.selectedMediaItemIds().has(item.mediaItemId);
  }

  clearSelection(): void {
    this.selectedMediaItemIds.set(new Set());
  }

  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(0);
  }

  requestSoftDelete(): void {
    const selectedIds = Array.from(this.selectedMediaItemIds());
    if (selectedIds.length === 0 || this.deleting()) {
      return;
    }

    this.softDeleteRequested.emit(selectedIds);
  }

  requestHardDelete(): void {
    const selectedIds = Array.from(this.selectedMediaItemIds());
    if (selectedIds.length === 0 || this.deleting()) {
      return;
    }

    this.hardDeleteRequested.emit(selectedIds);
  }

  openDetails(item: MediaItem): void {
    this.detailsRequested.emit(item);
  }

  setSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((direction) => direction === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortColumn.set(column);
    this.sortDirection.set('asc');
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn() !== column) {
      return '';
    }

    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(0, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages() - 1, page + 1));
  }

  private getSortableValue(item: MediaItem, column: SortColumn): string {
    return (item[column] ?? '').toString().toLocaleLowerCase();
  }
}
