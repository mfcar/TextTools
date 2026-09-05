import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiStore } from '../../core/state/ui-store';
import { Shell } from './shell';

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;
  let ui: InstanceType<typeof UiStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    ui = TestBed.inject(UiStore);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the sidebar toggle wired to the UI store', () => {
    const toggle = fixture.nativeElement.querySelector('[aria-controls="app-sidebar"]');
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    fixture.detectChanges();

    expect(ui.sidebarOpen()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Show sidebar');
  });

  it('projects content into the main landmark', () => {
    const main = fixture.nativeElement.querySelector('main.shell__main');
    expect(main).toBeTruthy();
  });

  it('registers the command-palette keyboard shortcut', () => {
    expect(ui.shortcuts().some((shortcut) => shortcut.id === 'open-palette')).toBe(true);
  });

  it('opens the palette from the header search button', () => {
    const trigger = fixture.nativeElement.querySelector('[aria-label="Open command palette"]');
    trigger.click();

    expect(ui.paletteOpen()).toBe(true);
  });

  it('toggles the palette with Ctrl+K', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    document.dispatchEvent(event);

    expect(ui.paletteOpen()).toBe(true);
  });
});
