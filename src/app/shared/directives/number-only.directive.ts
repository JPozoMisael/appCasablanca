import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: true,
})
export class NumberOnlyDirective {
  @Input() allowDecimal = false;
  @Input() allowNegative = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const original = input.value;

    let filtered = original.replace(/[^\d\.\-]/g, '');

    if (!this.allowDecimal) {
      filtered = filtered.replace(/\./g, '');
    } else {
      const parts = filtered.split('.');
      if (parts.length > 2) {
        filtered = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    if (!this.allowNegative) {
      filtered = filtered.replace(/\-/g, '');
    } else {
      filtered = filtered.replace(/(?!^)-/g, '');
    }

    if (filtered !== original) {
      input.value = filtered;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    const allowed = [
      'Backspace',
      'Tab',
      'Enter',
      'Escape',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];

    if (allowed.includes(e.key)) return;

    const ctrlCombo =
      (e.ctrlKey || e.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());

    if (ctrlCombo) return;

    if (/\d/.test(e.key)) return;
    if (this.allowDecimal && e.key === '.') return;
    if (this.allowNegative && e.key === '-') return;

    e.preventDefault();
  }
}
