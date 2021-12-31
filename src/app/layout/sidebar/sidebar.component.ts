import {Component, Input} from '@angular/core';
import {Sidebar} from '../../shared/models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() sidebar: Sidebar = Sidebar.commandsHistory;
}
