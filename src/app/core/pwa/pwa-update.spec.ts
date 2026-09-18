import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaUpdate } from './pwa-update';

interface FakeSwUpdate {
  isEnabled: boolean;
  versionUpdates: Subject<{ type: string }>;
  unrecoverable: Subject<{ reason: string }>;
  activateUpdate: ReturnType<typeof vi.fn>;
}

function configure(swUpdate: FakeSwUpdate, action: Subject<void>) {
  const open = vi.fn().mockReturnValue({ onAction: () => action });
  TestBed.configureTestingModule({
    providers: [
      { provide: SwUpdate, useValue: swUpdate },
      { provide: MatSnackBar, useValue: { open } },
    ],
  });
  return { open, service: TestBed.inject(PwaUpdate) };
}

describe('PwaUpdate', () => {
  let swUpdate: FakeSwUpdate;
  let action: Subject<void>;

  beforeEach(() => {
    swUpdate = {
      isEnabled: true,
      versionUpdates: new Subject(),
      unrecoverable: new Subject(),
      // Never resolves, so the reload() branch after activation does not run in tests.
      activateUpdate: vi.fn().mockReturnValue(new Promise<boolean>(() => undefined)),
    };
    action = new Subject<void>();
  });

  it('does nothing when the service worker is disabled', () => {
    swUpdate.isEnabled = false;
    const { open, service } = configure(swUpdate, action);

    service.init();
    swUpdate.versionUpdates.next({ type: 'VERSION_READY' });

    expect(open).not.toHaveBeenCalled();
  });

  it('prompts a reload when a new version is ready', () => {
    const { open, service } = configure(swUpdate, action);
    service.init();

    swUpdate.versionUpdates.next({ type: 'VERSION_READY' });

    expect(open).toHaveBeenCalledWith('A new version is available.', 'Reload');

    action.next();
    expect(swUpdate.activateUpdate).toHaveBeenCalled();
  });

  it('ignores non-ready version events', () => {
    const { open, service } = configure(swUpdate, action);
    service.init();

    swUpdate.versionUpdates.next({ type: 'VERSION_DETECTED' });

    expect(open).not.toHaveBeenCalled();
  });

  it('prompts a reload on an unrecoverable state without activating', () => {
    const { open, service } = configure(swUpdate, action);
    service.init();

    swUpdate.unrecoverable.next({ reason: 'corrupt' });

    expect(open).toHaveBeenCalledWith('The app needs to reload to keep working.', 'Reload');
  });
});
