import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true,
})
export class AutofocusDirective implements AfterViewInit {
  @Input() appAutofocus = true;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.appAutofocus) return;

    setTimeout(() => {
      const node = this.el.nativeElement as any;
      if (node && typeof node.focus === 'function') {
        node.focus();
        return;
      }

      const focusable = this.el.nativeElement.querySelector<HTMLElement>(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 0);
  }
}
