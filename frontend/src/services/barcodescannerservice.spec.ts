import { TestBed } from '@angular/core/testing';

import { Barcodescannerservice } from './barcodescannerservice';

describe('Barcodescannerservice', () => {
  let service: Barcodescannerservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barcodescannerservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
