import { TestBed } from '@angular/core/testing';

import { DeburrService } from './deburr.service';

describe('DeburrService', () => {
  let service: DeburrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeburrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
