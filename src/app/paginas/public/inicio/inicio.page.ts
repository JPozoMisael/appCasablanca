import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { CatalogoService } from '@app/core/services/catalogo.service';
import { HotelResumen, Zona } from '@app/shared/models/marketplace.model';
import { HotelCardComponent } from '@app/shared/components/hotel-card/hotel-card.component';
import { BusquedaFormValue, SearchFormComponent } from '@app/shared/components/search-form/search-form.component';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, IonIcon, SearchFormComponent, HotelCardComponent, MoneyPipe],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  private catalogo = inject(CatalogoService);
  private router = inject(Router);

  zonas: Zona[] = [];
  destacados: HotelResumen[] = [];
  cargando = true;
  error = false;

  readonly beneficios = [
    { icono: 'shield-checkmark-outline', titulo: 'Reserva segura', texto: 'Tus datos viajan protegidos y recibes un código para gestionar tu reserva.' },
    { icono: 'flash-outline', titulo: 'Confirmación inmediata', texto: 'Ves la disponibilidad real de cada hotel y confirmas al instante.' },
    { icono: 'pricetag-outline', titulo: 'Precios claros', texto: 'Tarifa por noche, impuestos y política de cancelación antes de reservar.' },
    { icono: 'people-outline', titulo: 'Opiniones verificadas', texto: 'Solo pueden opinar huéspedes que completaron su estadía.' },
  ];

  ngOnInit(): void {
    this.catalogo.zonas().subscribe({
      next: (z) => (this.zonas = z.filter((x) => x.total_hoteles > 0)),
      error: () => (this.error = true),
    });
    this.catalogo.destacados(8).subscribe({
      next: (h) => {
        this.destacados = h.map((x) => ({ ...x, precio_noche: Number(x.precio_noche) }));
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = true;
      },
    });
  }

  buscar(v: BusquedaFormValue): void {
    this.router.navigate(['/buscar'], {
      queryParams: {
        zona: v.zona || null,
        checkIn: v.checkIn || null,
        checkOut: v.checkOut || null,
        adultos: v.adultos,
        ninos: v.ninos || null,
        habitaciones: v.habitaciones > 1 ? v.habitaciones : null,
      },
    });
  }
}
