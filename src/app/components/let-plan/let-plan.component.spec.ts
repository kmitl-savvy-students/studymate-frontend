import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetPlanComponent } from './let-plan.component';

describe('LetPlanComponent', () => {
  let component: LetPlanComponent;
  let fixture: ComponentFixture<LetPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
