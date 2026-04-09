import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-comics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comics.page.html',
  styleUrl: './comics.page.scss',
})
export class ComicsPage {
  private readonly formBuilder = inject(FormBuilder);

  readonly comicsForm = this.formBuilder.group({
    seriesTitle: this.formBuilder.control('', { nonNullable: true }),
    issues: this.formBuilder.array([this.createIssueControl()]),
    notes: this.formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get issuesFormArray(): FormArray {
    return this.comicsForm.controls.issues;
  }

  get issueCount(): number {
    return this.issuesFormArray.length;
  }

  addIssue(): void {
    this.issuesFormArray.push(this.createIssueControl());
  }

  removeIssue(index: number): void {
    if (this.issuesFormArray.length === 1) {
      this.issuesFormArray.at(0).reset('');
      return;
    }

    this.issuesFormArray.removeAt(index);
  }

  resetComicsPlan(): void {
    this.comicsForm.reset({
      seriesTitle: '',
      notes: '',
    });
    this.comicsForm.setControl('issues', this.formBuilder.array([this.createIssueControl()]));
  }

  trackByIndex(index: number): number {
    return index;
  }

  private createIssueControl() {
    return this.formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required],
    });
  }
}
