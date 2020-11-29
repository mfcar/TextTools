import { TestBed } from '@angular/core/testing';

import { Base64EncodeService } from './base64-encode.service';

describe('Base64EncodeService', () => {
  let service: Base64EncodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Base64EncodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
