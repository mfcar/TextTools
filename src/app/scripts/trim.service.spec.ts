import { TestBed } from '@angular/core/testing';

import { TrimService } from './trim.service';

describe('TrimService', () => {
  let service: TrimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
