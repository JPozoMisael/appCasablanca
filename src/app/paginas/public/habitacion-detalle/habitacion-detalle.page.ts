import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HabitacionesService } from '@app/core/services/habitaciones.service';

@Component({
  selector: 'app-habitacion-detalle',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, RouterLink, FormsModule],
  templateUrl: './habitacion-detalle.page.html',
  styleUrls: ['./habitacion-detalle.page.scss'],
})
export class HabitacionDetallePage implements OnInit {

  // ================= ROUTE =================
  roomId = 0;

  // ================= SEARCH PARAMS =================
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  withPets = 0;

  // ================= DATA =================
  habitacion: any = null;
  mapUrlSafe: SafeResourceUrl | null = null;

  // ================= UI =================
  gallery: string[] = [];
  selectedImage: string = '';

  // ================= REVIEWS =================
  hotelId: number = 0;
  rating: number = 0;
  totalReviews: number = 0;
  reviews: any[] = [];

  availabilityHint: string = 'Quedan pocas habitaciones';

  // ================= FORM =================
  newReview = {
    puntuacion: 0,
    comentario: ''
  };

  submittingReview = false;

  hoverRating: number = 0;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private habitacionesService: HabitacionesService
  ) {}

  // ================= INIT =================
  ngOnInit() {

    this.route.paramMap.subscribe(pm => {
      this.roomId = Number(pm.get('id'));
      this.loadHabitacion();
    });

    this.route.queryParamMap.subscribe(qp => {
      this.checkIn = qp.get('checkIn') ?? '';
      this.checkOut = qp.get('checkOut') ?? '';
      this.adults = this.toNum(qp.get('adults'), 2);
      this.children = this.toNum(qp.get('children'), 0);
      this.rooms = this.toNum(qp.get('rooms'), 1);
      this.withPets = this.toNum(qp.get('withPets'), 0);
    });
  }

  // ================= BACKEND =================
  loadHabitacion() {

    this.habitacionesService.getById(this.roomId).subscribe({

      next: (h: any) => {

        if (!h) {
          this.habitacion = null;
          return;
        }

        this.hotelId = h.hotel_id ?? h.hotelId ?? 0;

        this.habitacion = {
          id: h.id,
          nombre: h.tipo || `Habitación ${h.numero}`,
          descripcion: h.descripcion || '',
          precio: h.precioNoche || h.precio || 0,
          capacidad: `${h.capacidad ?? 2} personas · ${h.camas ?? 1} cama(s)`,

          servicios: [
            'Wi-Fi',
            'Aire acondicionado',
            'TV',
            'Baño privado'
          ],

          lat: -2.2149,
          lng: -80.951,
          imagen: h.imagenUrl
        };

        // GALERÍA
        this.gallery = [
          this.habitacion.imagen,
          this.habitacion.imagen,
          this.habitacion.imagen
        ];

        this.selectedImage = this.gallery[0];

        // MAPA
        const url = `https://www.google.com/maps?q=${this.habitacion.lat},${this.habitacion.lng}&output=embed`;
        this.mapUrlSafe =
          this.sanitizer.bypassSecurityTrustResourceUrl(url);

        // REVIEWS
        this.loadReviews();
      },

      error: (err: any) => {
        console.error('ERROR DETALLE:', err);
        this.habitacion = null;
      }
    });
  }

  // ================= REVIEWS =================
  loadReviews() {

    if (!this.hotelId) return;

    this.habitacionesService
      .getReviewsByHotel(this.hotelId)
      .subscribe(data => {

        this.reviews = data || [];

        if (this.reviews.length > 0) {

          const total = this.reviews.reduce(
            (acc, r) => acc + Number(r.puntuacion || 0),
            0
          );

          this.rating = Number((total / this.reviews.length).toFixed(1));
          this.totalReviews = this.reviews.length;

        } else {
          this.rating = 0;
          this.totalReviews = 0;
        }
      });
  }

  // ================= FORM REVIEW =================
  setRating(value: number) {
    this.newReview.puntuacion = value;
  }

  isStarActive(i: number): boolean {
    return i <= this.newReview.puntuacion;
  }

  submitReview() {

    if (this.submittingReview) return;

    if (!this.hotelId) {
      alert('Error: hotel no identificado');
      return;
    }

    if (this.newReview.puntuacion < 1) {
      alert('Selecciona una puntuación');
      return;
    }

    this.submittingReview = true;

    this.habitacionesService.createReview({
      hotel_id: this.hotelId,
      puntuacion: this.newReview.puntuacion,
      comentario: this.newReview.comentario?.trim()
    }).subscribe({

      next: () => {

        this.newReview = { puntuacion: 0, comentario: '' };

        this.loadReviews();

        this.submittingReview = false;
      },

      error: () => {
        alert('Error al enviar review');
        this.submittingReview = false;
      }
    });
  }

  // ================= CALCULOS =================
  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;

    const a = new Date(this.checkIn).getTime();
    const b = new Date(this.checkOut).getTime();

    const diff = b - a;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  get total(): number {
    if (!this.habitacion) return 0;
    return this.habitacion.precio * (this.nights || 1);
  }

  // ================= UI =================
  selectImage(img: string) {
    this.selectedImage = img;
  }

  getRatingText(rating: number): string {
    if (rating >= 9) return 'Excelente';
    if (rating >= 8) return 'Muy bien';
    if (rating >= 7) return 'Bien';
    return 'Aceptable';
  }

  // ================= RESERVA =================
  reservar() {
    if (!this.habitacion) return;

    this.router.navigate(['/reservar'], {
      queryParams: {
        roomId: this.habitacion.id,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
        withPets: this.withPets,
      }
    });
  }

  // ================= UTILS =================
  private toNum(v: string | null, fallback: number): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
}