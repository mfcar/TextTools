import { TestBed } from '@angular/core/testing';

import { LowercaseService } from './lowercase.service';

describe('LowercaseService', () => {
  let service: LowercaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LowercaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
