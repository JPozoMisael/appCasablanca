import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonContent } from '@ionic/angular/standalone';

import { AppHeaderComponent } from '@app/shared/components/app-header/app-header.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [IonContent, CommonModule, RouterOutlet, IonApp, AppHeaderComponent],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();

  headerHidden = false;

  private lastTop = 0;
  private ticking = false;

  // ahora recibe el evento "scroll" normal
  onScroll(ev: Event) {
    const el = ev.target as HTMLElement | null;
    const top = el?.scrollTop ?? 0;

    const delta = top - this.lastTop;

    if (this.ticking) return;
    this.ticking = true;

    requestAnimationFrame(() => {
      if (top < 20) {
        this.headerHidden = false;
      } else if (delta > 8) {
        this.headerHidden = true;
      } else if (delta < -8) {
        this.headerHidden = false;
      }

      this.lastTop = top;
      this.ticking = false;
    });
  }
}
