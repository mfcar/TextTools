import { TestBed } from '@angular/core/testing';

import { CamelCaseService } from './camel-case.service';

describe('CamelCaseService', () => {
  let service: CamelCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CamelCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
