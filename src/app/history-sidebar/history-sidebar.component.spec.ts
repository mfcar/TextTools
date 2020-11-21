import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorySidebarComponent } from './history-sidebar.component';

describe('HistorySidebarComponent', () => {
  let component: HistorySidebarComponent;
  let fixture: ComponentFixture<HistorySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorySidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
