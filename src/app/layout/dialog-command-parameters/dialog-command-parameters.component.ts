import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {CommandParameter} from '../../shared/models';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-dialog-command-parameters',
  templateUrl: './dialog-command-parameters.component.html',
  styleUrls: ['./dialog-command-parameters.component.scss']
})
export class DialogCommandParametersComponent implements OnInit {
  formParameters: FormGroup | null = null;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<DialogCommandParametersComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: CommandParameter[]
  ) {
  }

  ngOnInit(): void {
    const parameters: any = {};
    this.data.forEach(parameter => {
      parameters[parameter.name] = new FormControl(parameter.defaultValue, Validators.required);
    });
    this.formParameters = new FormGroup(parameters);
  }

  dismiss(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  executeCommand(event: MouseEvent): void {
    const parameterList: any[] = [];
    this.data.sort(x => x.index).forEach(parameter => {
      parameterList.push(this.formParameters?.controls[parameter.name].value);
    });
    this.bottomSheetRef.dismiss(parameterList);
    event.preventDefault();
  }

}
