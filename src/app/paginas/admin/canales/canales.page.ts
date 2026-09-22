import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';
import { fechaCorta } from '@app/shared/utils/format';

interface Mapeo { id: number; tipo_habitacion_id: number; codigo_habitacion: string; tipoHabitacion?: { id: number; nombre: string } }
interface Conexion {
  id: number; codigo_hotel: string; estado: 'pendiente' | 'activa' | 'pausada'; moneda: string;
  precios_incluyen_impuestos: boolean; plan_tarifa_codigo: string; ultima_entrada_en?: string | null; ultimo_error?: string | null;
  mapeos: Mapeo[]; resumen: { fechas_cargadas: number; salidas_pendientes: number; salidas_con_error: number };
}
interface Config { endpoint_entrada: string; entrada_configurada: boolean; envio_configurado: boolean }
interface Mensaje { id: number; direccion: 'entrada' | 'salida'; tipo: string; resultado: 'ok' | 'error'; detalle?: string | null; ms?: number | null; createdAt: string }
interface Salida { id: number; accion: 'Commit' | 'Cancel'; estado: 'pendiente' | 'enviado' | 'error' | 'omitido'; intentos: number; ultimo_error?: string | null; reserva?: { codigo_reserva: string; fecha_entrada: string; fecha_salida: string } }

/** Conexión del alojamiento con su channel manager (SiteMinder / Little Hotelier): esta plataforma es un canal de venta más. */
@Component({
  selector: 'app-canales',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './canales.page.html',
})
export class CanalesPage implements OnInit {
  private api = inject(ApiService);

  conexion: Conexion | null = null;
  config: Config | null = null;
  mensajes: Mensaje[] = [];
  salidas: Salida[] = [];
  codigos: Record<number, string> = {};

  cargando = true;
  error = '';
  mensaje = '';
  copiado = '';
  readonly fechaCorta = fechaCorta;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.get<{ data: Conexion | null; config: Config }>('/channels/connection').subscribe({
      next: (r) => {
        this.conexion = r.data;
        this.config = r.config;
        this.codigos = Object.fromEntries((r.data?.mapeos ?? []).map((m) => [m.id, m.codigo_habitacion]));
        this.cargando = false;
        if (r.data) this.cargarActividad();
      },
      error: (e) => {
        this.error =
          e?.error?.code === 'HOTEL_REQUERIDO'
            ? 'Elige un alojamiento en "Operando en" (arriba a la derecha) para ver su conexión.'
            : (e?.error?.message ?? 'No pudimos cargar la conexión.');
        this.cargando = false;
      },
    });
  }

  private cargarActividad(): void {
    this.api.get<{ data: Mensaje[] }>('/channels/messages', { limit: 30 }).subscribe({ next: (r) => (this.mensajes = r.data), error: () => undefined });
    this.api.get<{ data: Salida[] }>('/channels/outbox').subscribe({ next: (r) => (this.salidas = r.data), error: () => undefined });
  }

  private fallo(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Ocurrió un error.';
  }

  conectar(): void {
    this.error = this.mensaje = '';
    this.api.post('/channels/connection', {}).subscribe({
      next: () => {
        this.mensaje = 'Conexión creada. Entrega el código del alojamiento a SiteMinder / Little Hotelier.';
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }

  cambiarEstado(estado: 'activa' | 'pausada'): void {
    if (estado === 'pausada' && !confirm('Mientras esté en pausa, las habitaciones conectadas NO se podrán reservar en esta plataforma. ¿Pausar?')) return;
    this.error = this.mensaje = '';
    this.api.put('/channels/connection', { estado }).subscribe({
      next: () => {
        this.mensaje = estado === 'pausada' ? 'Conexión en pausa.' : 'Conexión activa.';
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }

  cambiarImpuestos(valor: boolean): void {
    this.api.put('/channels/connection', { precios_incluyen_impuestos: valor }).subscribe({ next: () => this.cargar(), error: (e) => this.fallo(e) });
  }

  guardarCodigo(m: Mapeo): void {
    const codigo = (this.codigos[m.id] ?? '').trim();
    if (codigo === m.codigo_habitacion) return;
    this.error = this.mensaje = '';
    this.api.put(`/channels/mappings/${m.id}`, { codigo }).subscribe({
      next: () => {
        this.mensaje = 'Código actualizado. Debe coincidir con el que tiene SiteMinder para esa habitación.';
        this.cargar();
      },
      error: (e) => {
        this.error = e?.error?.details?.[0]?.mensaje ?? e?.error?.message ?? 'No se pudo guardar el código (solo letras, números, guion y guion bajo).';
        this.codigos[m.id] = m.codigo_habitacion;
      },
    });
  }

  actualizarTipos(): void {
    this.api.post('/channels/connection/sync-types', {}).subscribe({
      next: () => {
        this.mensaje = 'Tipos de habitación actualizados.';
        this.cargar();
      },
      error: (e) => this.fallo(e),
    });
  }

  reintentar(s: Salida): void {
    this.api.post(`/channels/outbox/${s.id}/retry`, {}).subscribe({
      next: () => {
        this.mensaje = 'Reintento programado.';
        setTimeout(() => this.cargar(), 1500);
      },
      error: (e) => this.fallo(e),
    });
  }

  copiar(texto: string, clave: string): void {
    navigator.clipboard?.writeText(texto).then(() => {
      this.copiado = clave;
      setTimeout(() => (this.copiado = ''), 1800);
    });
  }

  claseEstado(e: string): string {
    return e === 'activa' || e === 'enviado' || e === 'ok' ? 'ok' : e === 'pausada' || e === 'pendiente' ? 'warn' : e === 'omitido' ? 'muted' : 'danger';
  }
}
