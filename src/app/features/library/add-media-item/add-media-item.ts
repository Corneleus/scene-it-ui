import { Component, EventEmitter, Output, ViewChild, ViewContainerRef, input } from '@angular/core';
import { AddMediaItemModalComponent } from '../add-media-item-modal/add-media-item-modal';
import { MediaKind } from '../../../models/media-item.model';

@Component({
  selector: 'app-add-media-item',
  standalone: true,
  imports: [],
  templateUrl: './add-media-item.html',
  styleUrl: './add-media-item.scss',
})
export class AddMediaItemComponent {
  triggerLabel = input('Add Media Item');
  itemLabel = input('media item');
  kind = input<MediaKind | null>(null);
  @Output() mediaItemAdded = new EventEmitter<string>();

  @ViewChild('modalHost', { read: ViewContainerRef, static: true })
  modalHost!: ViewContainerRef;

  openModal() {
    this.modalHost.clear();

    const modalRef = this.modalHost.createComponent(AddMediaItemModalComponent);
    modalRef.instance.kind = this.kind();
    modalRef.instance.itemLabel = this.itemLabel();

    modalRef.instance.close.subscribe(() => {
      modalRef.destroy();
    });

    modalRef.instance.mediaItemAdded.subscribe((title: string) => {
      this.mediaItemAdded.emit(title);
    });
  }
}
