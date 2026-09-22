import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '@app/core/services/auth.service';
import { Reserva } from '@app/shared/models/marketplace.model';
import { MoneyPipe } from '@app/shared/pipes/money.pipe';
import { ETIQUETA_ESTADO, fechaLarga } from '@app/shared/utils/format';

@Component({
  selector: 'app-reserva-confirmada',
  standalone: true,
  imports: [RouterLink, IonIcon, MoneyPipe],
  templateUrl: './reserva-confirmada.page.html',
  styleUrls: ['./reserva-confirmada.page.scss'],
})
export class ReservaConfirmadaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  reserva: Reserva | null = null;
  codigo = '';
  copiado = false;
  readonly fechaLarga = fechaLarga;
  readonly estados = ETIQUETA_ESTADO;

  get logueado(): boolean {
    return this.auth.estaLogueado();
  }

  ngOnInit(): void {
    this.codigo = this.route.snapshot.queryParamMap.get('codigo') ?? '';
    // La reserva llega por el estado de navegación; si se recarga la página se pide el código+email.
    const estado = (this.router.getCurrentNavigation()?.extras.state ?? history.state) as { reserva?: Reserva };
    if (estado?.reserva) {
      this.reserva = estado.reserva;
      this.codigo = estado.reserva.codigo_reserva;
    } else {
      this.router.navigate(['/consultar-reserva'], { queryParams: { codigo: this.codigo || null }, replaceUrl: true });
    }
  }

  get whatsapp(): string | null {
    const n = this.reserva?.hotel?.whatsapp?.replace(/\D/g, '');
    return n ? `https://wa.me/${n}` : null;
  }

  copiar(): void {
    navigator.clipboard?.writeText(this.codigo).then(() => {
      this.copiado = true;
      setTimeout(() => (this.copiado = false), 2000);
    });
  }

  imprimir(): void {
    window.print();
  }
}
