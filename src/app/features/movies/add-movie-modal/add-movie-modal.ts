import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MovieService } from '../movies.service';


@Component({
  selector: 'app-add-movie-modal',
  standalone: true,
  imports:[ReactiveFormsModule] ,
  templateUrl: './add-movie-modal.html',
  styleUrls: ['./add-movie-modal.scss']
})

export class AddMovieModalComponent {
  movieForm = new FormGroup({
    title: new FormControl(''),
    year: new FormControl(''),
  });

  constructor(private movieService: MovieService) {}

  @Output() close = new EventEmitter<void>();

  onSave() {
    console.log(this.movieForm.value);
    this.onClose();
  }

  onClose() {
    this.close.emit();
    console.log('Modal closed');
  }

}
//this was old  
//export class AddMovieModalComponent {
//   @Output() close = new EventEmitter<void>();
//   @Output() save = new EventEmitter<any>();

//   movieForm: FormGroup;

//   constructor(private fb: FormBuilder) {
//     this.movieForm = this.fb.group({
//       title: [''],
//       year: ['']
//     });
//   }

//   onClose() {
//     this.close.emit();
//   }

//   onSave() {
//     this.save.emit(this.movieForm);
//     this.close.emit();
//   }
// }