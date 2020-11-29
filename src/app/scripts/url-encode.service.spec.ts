import { TestBed } from '@angular/core/testing';

import { UrlEncodeService } from './url-encode.service';

describe('UrlEncodeService', () => {
  let service: UrlEncodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlEncodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
