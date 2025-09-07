import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Directcomponent } from './directcomponent';

describe('Directcomponent', () => {
  let component: Directcomponent;
  let fixture: ComponentFixture<Directcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Directcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Directcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
