import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSelectCommandComponent } from './dialog-select-command.component';

describe('DialogSelectCommandComponent', () => {
  let component: DialogSelectCommandComponent;
  let fixture: ComponentFixture<DialogSelectCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogSelectCommandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSelectCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
