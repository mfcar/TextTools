import { TestBed } from '@angular/core/testing';

import { HistoryManagerService } from './history-manager.service';

describe('HistoryManagerService', () => {
  let service: HistoryManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
