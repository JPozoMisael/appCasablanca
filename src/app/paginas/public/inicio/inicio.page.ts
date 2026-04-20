import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SearchBarComponent } from '@app/shared/components/search-bar/search-bar.component';
import { HotelesService } from '@app/core/services/hotel.service';
import { Hotel } from '@app/shared/models/hotel.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    SearchBarComponent
  ],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  // ================= DATA =================
  hoteles: Hotel[] = [];
  loading = true;

  // ================= SERVICIOS =================
  services = [
    { name: 'WiFi gratis', icon: 'wifi-outline' },
    { name: 'Piscina', icon: 'water-outline' },
    { name: 'Aire acondicionado', icon: 'snow-outline' },
    { name: 'Restaurante', icon: 'restaurant-outline' },
  ];

  // ================= MAPA =================
  mapEmbedUrl: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private hotelesService: HotelesService
  ) {
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=Salinas+Ecuador&output=embed'
    );
  }

  // ================= INIT =================
  ngOnInit(): void {
    this.loadHoteles();
  }

  // ================= BACKEND =================
  loadHoteles() {
    this.loading = true;

    this.hotelesService.getResumen().subscribe({

      // 🔥 YA NO ES res.data → ya viene limpio
      next: (hoteles) => {

        this.hoteles = hoteles.map(h => ({
          ...h,

          // imagen segura
          imagen: this.getImage(h.imagen),

          // rating real o fallback
          rating: Number((h as any).rating) || 0
        }));

        this.loading = false;
      },

      error: (err) => {
        console.error('Error cargando hoteles:', err);
        this.loading = false;
      }

    });
  }

  // ================= HELPERS =================

  getImage(img?: string): string {
    return img && img.trim() !== ''
      ? img
      : 'assets/img/default.jpg';
  }

  // ⭐ estrellas reales
  getStars(rating: number): string[] {
    const stars: string[] = [];

    const fullStars = Math.round(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? 'star' : 'star-outline');
    }

    return stars;
  }

  // ⭐ texto rating
  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excepcional';
    if (rating >= 4) return 'Muy bueno';
    if (rating >= 3) return 'Bueno';
    if (rating >= 2) return 'Aceptable';
    return 'Básico';
  }

  // ================= MAP =================
  openMap(event?: Event) {
    if (event) event.preventDefault();
    window.open('https://maps.google.com/?q=Salinas+Ecuador', '_blank');
  }

  // ================= UTILS =================
  trackById(index: number, item: Hotel) {
    return item.id;
  }

}