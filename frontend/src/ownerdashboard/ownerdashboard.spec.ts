import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ownerdashboard } from './ownerdashboard';

describe('Ownerdashboard', () => {
  let component: Ownerdashboard;
  let fixture: ComponentFixture<Ownerdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ownerdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ownerdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
