import { TestBed } from '@angular/core/testing';
import { ComicsPage } from './comics.page';

describe('ComicsPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicsPage],
    }).compileComponents();
  });

  it('renders the comics form sections', () => {
    const fixture = TestBed.createComponent(ComicsPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Issue tracker');
    expect(fixture.nativeElement.textContent).toContain('Reading and collection notes');
  });

  it('adds and removes issue rows', () => {
    const fixture = TestBed.createComponent(ComicsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    component.addIssue();
    component.addIssue();

    expect(component.issuesFormArray.length).toBe(3);

    component.removeIssue(1);

    expect(component.issuesFormArray.length).toBe(2);
  });

  it('resets the final issue row instead of removing it', () => {
    const fixture = TestBed.createComponent(ComicsPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.issuesFormArray.at(0).setValue('#1');

    component.removeIssue(0);

    expect(component.issuesFormArray.length).toBe(1);
    expect(component.issuesFormArray.at(0).value).toBe('');
  });
});
