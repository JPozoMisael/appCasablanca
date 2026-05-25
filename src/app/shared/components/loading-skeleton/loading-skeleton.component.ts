import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonMode = 'card' | 'list' | 'grid' | 'table' | 'detail' | 'profile';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss'],
})
export class LoadingSkeletonComponent {
  @Input() rows = 3;
  @Input() mode: SkeletonMode = 'card';
  @Input() imageHeight = 180;
  @Input() gridColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  @Input() gridRows = 6;
}