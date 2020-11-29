import { TestBed } from '@angular/core/testing';

import { UppercaseService } from './uppercase.service';

describe('UppercaseService', () => {
  let service: UppercaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UppercaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
