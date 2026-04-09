import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cookbook',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cookbook.page.html',
  styleUrl: './cookbook.page.scss',
})
export class CookbookPage {
  private readonly formBuilder = inject(FormBuilder);

  readonly recipeForm = this.formBuilder.group({
    title: this.formBuilder.control('', { nonNullable: true }),
    items: this.formBuilder.array([this.createItemControl()]),
    preparation: this.formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get itemsFormArray(): FormArray {
    return this.recipeForm.controls.items;
  }

  get ingredientCount(): number {
    return this.itemsFormArray.length;
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemControl());
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length === 1) {
      this.itemsFormArray.at(0).reset('');
      return;
    }

    this.itemsFormArray.removeAt(index);
  }

  resetRecipe(): void {
    this.recipeForm.reset({
      title: '',
      preparation: '',
    });
    this.recipeForm.setControl('items', this.formBuilder.array([this.createItemControl()]));
  }

  trackByIndex(index: number): number {
    return index;
  }

  private createItemControl() {
    return this.formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required],
    });
  }
}
