import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MediaMatcher} from '@angular/cdk/layout';

@Component({
  selector: 'app-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss']
})
export class EditorCanvasComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList | undefined;

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  // @ts-ignore
  filteredOptions: Observable<string[]>;

  private mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);
  }

  ngOnInit(): void {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(): void {
    // @ts-ignore
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }
}
