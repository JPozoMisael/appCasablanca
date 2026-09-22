import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { DashboardData, GestionService, PlataformaStats } from '@app/core/services/gestion.service';
import { HotelScopeService } from '@app/core/services/hotel-scope.service';
import { MenuService } from '@app/core/services/menu.service';
import { Reserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { fechaCorta } from '@app/shared/utils/format';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MoneyPipe],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private gestion = inject(GestionService);
  private auth = inject(AuthService);
  private scope = inject(HotelScopeService);
  private menu = inject(MenuService);

  data: DashboardData | null = null;
  llegadas: Reserva[] = [];
  salidas: Reserva[] = [];
  enCasa: Reserva[] = [];
  plataforma: PlataformaStats | null = null;
  cargando = true;
  error = '';
  mensaje = '';
  ocupado = 0;
  readonly fechaCorta = fechaCorta;

  get puedeOperar(): boolean {
    return this.menu.tiene('reservas.gestionar');
  }

  get esPlataforma(): boolean {
    return this.auth.esSuperAdmin() && !this.scope.get();
  }

  get puedeVerFinanzas(): boolean {
    return this.menu.tiene('pagos.ver');
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    if (this.esPlataforma) {
      this.gestion.statsPlataforma().subscribe({
        next: (s) => {
          this.plataforma = s;
          this.cargando = false;
        },
        error: (e) => this.fallo(e),
      });
      return;
    }

    if (this.menu.tiene('reservas.ver')) {
      this.gestion.hoy().subscribe({
        next: (h) => {
          this.llegadas = h.llegadas;
          this.salidas = h.salidas;
          this.enCasa = h.en_casa;
        },
        error: (e) => this.fallo(e),
      });
    }
    if (this.menu.tiene('dashboard.ver')) {
      this.gestion.dashboard().subscribe({
        next: (d) => {
          this.data = d;
          this.cargando = false;
        },
        error: (e) => this.fallo(e),
      });
    } else {
      this.cargando = false;
    }
  }

  private fallo(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'No pudimos cargar el resumen.';
    this.cargando = false;
  }

  accion(r: Reserva, tipo: 'checkin' | 'checkout'): void {
    this.gestion.transicion(r.id, tipo).subscribe({
      next: () => {
        this.mensaje = tipo === 'checkin' ? 'Llegada registrada.' : 'Salida registrada.';
        this.cargar();
      },
      error: (e) => (this.error = e?.error?.message ?? 'No se pudo completar la acción.'),
    });
  }

  habitaciones(r: Reserva): string {
    return (r.detalles ?? []).map((d) => d.habitacion?.numero_habitacion).filter(Boolean).join(', ');
  }
}
