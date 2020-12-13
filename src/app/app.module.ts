import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HeaderComponent} from './layout/header/header.component';
import {FooterComponent} from './layout/footer/footer.component';
import {SidebarHistoryComponent} from './layout/sidebar-history/sidebar-history.component';
import {DialogCommandPaletteComponent} from './layout/dialog-command-palette/dialog-command-palette.component';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import { EditorCanvasComponent } from './layout/editor-canvas/editor-canvas.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { DialogCommandParametersComponent } from './layout/dialog-command-parameters/dialog-command-parameters.component';
import { SidebarCommandsComponent } from './layout/sidebar-commands/sidebar-commands.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { DialogDownloadFileComponent } from './layout/dialog-download-file/dialog-download-file.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CommandsListComponent } from './layout/commands-list/commands-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarHistoryComponent,
    DialogCommandPaletteComponent,
    EditorCanvasComponent,
    DialogCommandParametersComponent,
    SidebarCommandsComponent,
    DialogDownloadFileComponent,
    SidebarComponent,
    CommandsListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatListModule,
    MatIconModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    ClipboardModule,
    MatTooltipModule,
    MatCardModule,
    MatSidenavModule,
    MatButtonModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
