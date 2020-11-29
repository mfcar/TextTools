import { TestBed } from '@angular/core/testing';

import { UrlDecodeService } from './url-decode.service';

describe('UrlDecodeService', () => {
  let service: UrlDecodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UrlDecodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
