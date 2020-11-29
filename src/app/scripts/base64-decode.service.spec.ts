import { TestBed } from '@angular/core/testing';

import { Base64DecodeService } from './base64-decode.service';

describe('Base64DecodeService', () => {
  let service: Base64DecodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Base64DecodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
