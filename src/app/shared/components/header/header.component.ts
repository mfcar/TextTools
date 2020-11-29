import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {DialogSelectCommandComponent} from '../../../dialog-select-command/dialog-select-command.component';
import {Script} from '../../../models';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleHistorySidebarEvent: EventEmitter<any> = new EventEmitter();
  @Output() executeCommandEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    public dialog: MatDialog) {
  }

  toggleHistorySidebar(): void {
    this.toggleHistorySidebarEvent.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  @HostListener('document:keydown.shift.control.a')
  openCommandDialog(): void {
    const dialogRef = this.dialog.open(DialogSelectCommandComponent, {
      width: '500px',
      height: '470px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this.executeTransform(result as Script);
        this.executeCommandEvent.emit({result});
      }
    });
  }
}
