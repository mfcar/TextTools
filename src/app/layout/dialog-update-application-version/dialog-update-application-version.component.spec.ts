import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogUpdateApplicationVersionComponent} from './dialog-update-application-version.component';

describe('DialogUpdateApplicationVersionComponent', () => {
  let component: DialogUpdateApplicationVersionComponent;
  let fixture: ComponentFixture<DialogUpdateApplicationVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogUpdateApplicationVersionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogUpdateApplicationVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
