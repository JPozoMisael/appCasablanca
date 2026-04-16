import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SearchBarComponent } from '@app/shared/components/search-bar/search-bar.component';
import { HotelesService } from '@app/core/services/hotel.service';

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
  hoteles: any[] = [];
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
      next: (res: any) => {

        this.hoteles = (res.data || []).map((h: any) => ({
          ...h,

          // 🔥 IMAGEN SEGURA
          imagen: this.getImage(h.imagen),

          // 🔥 RATING REAL (YA NO MOCK)
          rating: Number(h.rating) || 0
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

  // 🔥 IMAGEN SEGURA
  getImage(img: string | null): string {
    return img && img.trim() !== '' ? img : 'assets/img/default.jpg';
  }

  // 🔥 ESTRELLAS (1–5 REAL)
  getStars(rating: number): string[] {
    const stars: string[] = [];

    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? 'star' : 'star-outline');
    }

    return stars;
  }

  // 🔥 TEXTO RATING REAL
  getRatingText(rating: number): string {
    if (rating >= 5) return 'Excepcional';
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

  // ================= DEMO (puedes borrar luego) =================
  roomsData = [
    {
      id: 1,
      name: 'Suite Vista al Mar',
      description: 'Habitación amplia con balcón',
      price: 120,
    },
    {
      id: 2,
      name: 'Habitación Doble',
      description: 'Ideal para parejas',
      price: 80,
    }
  ];

  // ================= UTILS =================
  trackById(index: number, item: any) {
    return item.id;
  }

}