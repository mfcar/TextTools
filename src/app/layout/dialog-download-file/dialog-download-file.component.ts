import {Component, Inject} from '@angular/core';
import * as FileSaver from 'file-saver';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-download-file',
  templateUrl: './dialog-download-file.component.html',
  styleUrls: ['./dialog-download-file.component.scss']
})
export class DialogDownloadFileComponent {
  fileName = 'code';
  fileExt = 'txt';
  fileCharset = 'utf-8';
  fileType = 'text/plain';

  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {
  }

  saveFile(): void {
    const blob = new Blob([this.data], {type: `${this.fileType};charset=${this.fileCharset}`});
    FileSaver.saveAs(blob, `${this.fileName}.${this.fileExt}`);
  }
}
