import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';

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

  /* ======================================================
     DATA
  ====================================================== */
  hoteles: Hotel[] = [];
  featuredHotel: Hotel | null = null;
  loading = true;
  newsletterEmail = '';

  /* ======================================================
     SERVICES
  ====================================================== */
  services = [
    { name: 'WiFi gratis', icon: 'wifi-outline' },
    { name: 'Piscina', icon: 'water-outline' },
    { name: 'Aire acondicionado', icon: 'snow-outline' },
    { name: 'Restaurante', icon: 'restaurant-outline' },
    { name: 'Frente al mar', icon: 'sunny-outline' },
    { name: 'Parqueadero', icon: 'car-outline' },
    { name: 'Recepción 24/7', icon: 'time-outline' },
    { name: 'Habitaciones familiares', icon: 'people-outline' }
  ];

  /* ======================================================
     UBICACIONES DESTACADAS (NUEVO - Reemplaza el mapa)
  ====================================================== */
  locations = [
    {
      slug: 'chipipe',
      name: 'Chipipe',
      description: 'Playa tranquila ideal para familias. Aguas calmadas y excelente vista al mar.',
      image: 'assets/img/chipipe.jpg',
      rating: 4.8,
      features: [
        { icon: 'water-outline', label: 'Playa tranquila' },
        { icon: 'restaurant-outline', label: 'Restaurantes' },
        { icon: 'car-outline', label: 'Fácil acceso' }
      ]
    },
    {
      slug: 'palmeras',
      name: 'Palmeras',
      description: 'Zona vibrante cerca del malecón. Ideal para disfrutar la vida nocturna.',
      image: 'assets/img/palmeras.jpg',
      rating: 4.9,
      features: [
        { icon: 'sunny-outline', label: 'Malecón' },
        { icon: 'beer-outline', label: 'Bares' },
        { icon: 'walk-outline', label: 'Zona peatonal' }
      ]
    },
    {
      slug: 'ballenita',
      name: 'Ballenita',
      description: 'Atardeceres espectaculares y vistas panorámicas. Perfecto para desconectar.',
      image: 'assets/img/ballenita.jpg',
      rating: 4.7,
      features: [
        { icon: 'boat-outline', label: 'Vistas únicas' },
        { icon: 'fish-outline', label: 'Gastronomía' },
        { icon: 'moon-outline', label: 'Relax total' }
      ]
    }
  ];

  /* ======================================================
     BENEFICIOS
  ====================================================== */
  benefits = [
    {
      icon: 'shield-checkmark-outline',
      title: 'Reserva Segura',
      description: 'Tus datos están protegidos con encriptación SSL'
    },
    {
      icon: 'flash-outline',
      title: 'Confirmación Inmediata',
      description: 'Recibirás tu confirmación al instante'
    },
    {
      icon: 'pricetag-outline',
      title: 'Mejor Precio',
      description: 'Garantizado en todas tus reservas'
    },
    {
      icon: 'headset-outline',
      title: 'Soporte 24/7',
      description: 'Atención personalizada cuando la necesites'
    }
  ];

  /* ======================================================
     EXPERIENCIAS
  ====================================================== */
  experiencias = [
    {
      title: 'Frente al mar',
      desc: 'Despierta con vistas únicas de Salinas',
      image: 'assets/img/exp-mar.jpg',
      badge: 'Más reservado',
      button: 'Ver habitaciones',
      route: '/hotel/chipipe',
      badgeClass: ''
    },
    {
      title: 'Piscina & relax',
      desc: 'Suites diseñadas para desconectarte',
      image: 'assets/img/exp-piscina.jpg',
      badge: 'Relax premium',
      button: 'Explorar suites',
      route: '/hotel/palmeras',
      badgeClass: 'secondary'
    },
    {
      title: 'Gastronomía',
      desc: 'Restaurantes y experiencias frente al mar',
      image: 'assets/img/exp-food.jpg',
      badge: 'Experiencia top',
      button: 'Descubrir',
      route: '/hotel/palmeras',
      badgeClass: 'dark'
    }
  ];

  /* ======================================================
     CONSTRUCTOR
  ====================================================== */
  constructor(
    private sanitizer: DomSanitizer,
    private hotelesService: HotelesService,
    private router: Router
  ) {}

  /* ======================================================
     INIT
  ====================================================== */
  ngOnInit(): void {
    this.loadHoteles();
    this.loadFeaturedHotel();
  }

  /* ======================================================
     LOAD HOTELES
  ====================================================== */
  loadHoteles(): void {
    this.loading = true;
    this.hotelesService.getResumen().subscribe({
      next: (hoteles) => {
        this.hoteles = hoteles.map(h => ({
          ...h,
          imagen: this.getImage(h.imagen),
          rating: Number((h as any).rating) || 4
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando hoteles:', err);
        this.loading = false;
      }
    });
  }

  /* ======================================================
     FEATURED HOTEL
  ====================================================== */
  loadFeaturedHotel(): void {
    this.hotelesService.getFeatured().subscribe({
      next: (hotel) => {
        if (!hotel) {
          this.featuredHotel = null;
          return;
        }
        this.featuredHotel = {
          ...hotel,
          imagen: this.getImage(hotel.imagen),
          rating: Number((hotel as any).rating) || 4
        };
      },
      error: (err) => {
        console.error('Error featured hotel:', err);
        this.featuredHotel = null;
      }
    });
  }

  /* ======================================================
     IMAGE
  ====================================================== */
  getImage(img?: string): string {
    return img && img.trim() !== '' ? img : 'assets/img/2.PNG';
  }

  /* ======================================================
     Navegar a hotel por slug
  ====================================================== */
  goToHotel(slug: string): void {
    this.router.navigate(['/hotel', slug]);
  }

  /* ======================================================
     NEWSLETTER
  ====================================================== */
  subscribeNewsletter(): void {
    if (!this.newsletterEmail) return;
    // Aquí puedes llamar a tu API para guardar el email
    console.log('Newsletter subscription:', this.newsletterEmail);
    alert('¡Gracias por suscribirte!');
    this.newsletterEmail = '';
  }

  /* ======================================================
     STARS
  ====================================================== */
  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.round(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? 'star' : 'star-outline');
    }
    return stars;
  }

  /* ======================================================
     RATING TEXT
  ====================================================== */
  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excepcional';
    if (rating >= 4) return 'Muy bueno';
    if (rating >= 3) return 'Bueno';
    if (rating >= 2) return 'Aceptable';
    return 'Básico';
  }

  /* ======================================================
     TRACK BY
  ====================================================== */
  trackById(index: number, item: Hotel): number {
    return item.id;
  }
}