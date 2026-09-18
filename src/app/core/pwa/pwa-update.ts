import { DestroyRef, Service, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Surfaces service-worker updates: prompts a reload when a new version is
 * ready, and forces one when the app enters an unrecoverable state. Inert in
 * dev (the service worker is disabled), so it never prompts there.
 */
@Service()
export class PwaUpdate {
  private readonly swUpdate = inject(SwUpdate);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  init(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }
    this.swUpdate.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.promptReload('A new version is available.', true));

    this.swUpdate.unrecoverable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.promptReload('The app needs to reload to keep working.', false));
  }

  private promptReload(message: string, activate: boolean): void {
    const ref = this.snackBar.open(message, 'Reload');
    ref.onAction().subscribe(() => this.reload(activate));
  }

  private async reload(activate: boolean): Promise<void> {
    if (activate) {
      await this.swUpdate.activateUpdate();
    }
    document.location.reload();
  }
}
