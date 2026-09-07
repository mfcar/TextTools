import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class Autofocus {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.element.nativeElement.focus());
  }
}
