import { Component, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { AddMovieModalComponent } from '../add-movie-modal/add-movie-modal';

@Component({
  selector: 'app-add-movie',
  imports: [],
  templateUrl: './add-movie.html',
  styles: ``,
})
export class AddMovie {
  @Output() close = new EventEmitter<void>();  // <-- add this
  
  @ViewChild('modalHost', { read: ViewContainerRef, static: true })
  modalHost!: ViewContainerRef;

  openModal() {
    // Clear previous modal if any
    this.modalHost.clear();

    // Dynamically create modal component
    const modalRef = this.modalHost.createComponent(AddMovieModalComponent);

    // Listen to the close event
    modalRef.instance.close.subscribe(() => {
      modalRef.destroy(); // remove modal from DOM
    });
  }
}