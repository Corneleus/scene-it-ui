import { TestBed } from '@angular/core/testing';
import { CookbookPage } from './cookbook.page';

describe('CookbookPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookbookPage],
    }).compileComponents();
  });

  it('renders the cookbook form sections', () => {
    const fixture = TestBed.createComponent(CookbookPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ingredients list');
    expect(fixture.nativeElement.textContent).toContain('Preparation');
  });

  it('adds and removes ingredient rows', () => {
    const fixture = TestBed.createComponent(CookbookPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.addItem();
    component.addItem();

    expect(component.itemsFormArray.length).toBe(3);

    component.removeItem(1);

    expect(component.itemsFormArray.length).toBe(2);
  });

  it('resets the final ingredient row instead of removing it', () => {
    const fixture = TestBed.createComponent(CookbookPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.itemsFormArray.at(0).setValue('1 onion');

    component.removeItem(0);

    expect(component.itemsFormArray.length).toBe(1);
    expect(component.itemsFormArray.at(0).value).toBe('');
  });
});
