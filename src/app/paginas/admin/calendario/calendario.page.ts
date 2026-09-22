import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { MenuService } from '@app/core/services/menu.service';
import { ETIQUETA_ESTADO, desdeISO, hoyISO, sumarDias } from '@app/shared/utils/format';

interface HabCal { id: number; numero_habitacion: string; piso?: number | null; estado: string; tipo_habitacion_id: number; tipoHabitacion?: { id: number; nombre: string } }
interface ResCal { id: number; codigo_reserva: string; estado: string; fecha_entrada: string; fecha_salida: string; num_huespedes: number; canal: string; huesped: string; habitaciones: number[] }
interface BloqueoCal { id: number; habitacion_id: number; fecha_inicio: string; fecha_fin: string; tipo_bloqueo: string; motivo?: string | null }
interface Calendario { desde: string; hasta: string; dias: number; habitaciones: HabCal[]; reservas: ResCal[]; bloqueos: BloqueoCal[] }

interface Dia { iso: string; numero: number; semana: string; mes: string; hoy: boolean; finde: boolean; nuevoMes: boolean }
interface Barra { clase: string; inicio: number; largo: number; texto: string; titulo: string; reservaId?: number; codigo?: string }
interface FilaHab { hab: HabCal; barras: Barra[] }
interface Grupo { tipo: string; filas: FilaHab[] }

/** Calendario de ocupación: una fila por habitación y una columna por día. */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private menu = inject(MenuService);

  desde = hoyISO();
  dias = 14;
  cargando = true;
  error = '';

  cabecera: Dia[] = [];
  grupos: Grupo[] = [];
  ocupacion: { ocupadas: number; pct: number }[] = [];
  totalHabitaciones = 0;

  readonly estados = ETIQUETA_ESTADO;
  readonly hoy = hoyISO();

  get puedeReservar(): boolean {
    return this.menu.tiene('reservas.gestionar');
  }

  get columnas(): string {
    return `150px repeat(${this.dias}, minmax(34px, 1fr))`;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.get<{ data: Calendario }>('/calendar', { desde: this.desde, dias: this.dias }).subscribe({
      next: (r) => {
        this.armar(r.data);
        this.cargando = false;
      },
      error: (e) => {
        this.error =
          e?.error?.code === 'HOTEL_REQUERIDO'
            ? 'Elige un alojamiento en "Operando en" (arriba a la derecha) para ver su calendario.'
            : (e?.error?.message ?? 'No pudimos cargar el calendario.');
        this.cargando = false;
      },
    });
  }

  private armar(c: Calendario): void {
    this.dias = c.dias;
    const fmtSemana = new Intl.DateTimeFormat('es-EC', { weekday: 'short' });
    const fmtMes = new Intl.DateTimeFormat('es-EC', { month: 'short' });
    this.cabecera = Array.from({ length: c.dias }, (_, i) => {
      const iso = sumarDias(c.desde, i);
      const d = desdeISO(iso);
      return {
        iso,
        numero: d.getDate(),
        semana: fmtSemana.format(d).replace('.', ''),
        mes: fmtMes.format(d).replace('.', ''),
        hoy: iso === this.hoy,
        finde: [0, 6].includes(d.getDay()),
        nuevoMes: i === 0 || d.getDate() === 1,
      };
    });

    // índice de columna (0..dias-1) de una fecha; se recorta a la ventana visible
    const indice = (iso: string) => Math.round((desdeISO(iso).getTime() - desdeISO(c.desde).getTime()) / 86400000);

    const barrasPorHab = new Map<number, Barra[]>();
    const ocupadasPorDia = new Array<number>(c.dias).fill(0);

    for (const r of c.reservas) {
      const ini = Math.max(0, indice(r.fecha_entrada));
      const fin = Math.min(c.dias, indice(r.fecha_salida)); // noche de salida no ocupa
      if (fin <= ini) continue;
      const estado = this.estados[r.estado]?.texto ?? r.estado;
      for (const habId of r.habitaciones) {
        if (!barrasPorHab.has(habId)) barrasPorHab.set(habId, []);
        barrasPorHab.get(habId)!.push({
          clase: `res ${r.estado}`,
          inicio: ini,
          largo: fin - ini,
          texto: r.huesped,
          titulo: `${r.codigo_reserva} · ${r.huesped} · ${r.num_huespedes} huésped(es) · ${estado}`,
          reservaId: r.id,
          codigo: r.codigo_reserva,
        });
        for (let i = ini; i < fin; i++) ocupadasPorDia[i]++;
      }
    }

    for (const b of c.bloqueos) {
      const ini = Math.max(0, indice(b.fecha_inicio));
      const fin = Math.min(c.dias, indice(b.fecha_fin) + 1); // el bloqueo incluye su último día
      if (fin <= ini) continue;
      if (!barrasPorHab.has(b.habitacion_id)) barrasPorHab.set(b.habitacion_id, []);
      barrasPorHab.get(b.habitacion_id)!.push({
        clase: 'bloqueo',
        inicio: ini,
        largo: fin - ini,
        texto: b.motivo || b.tipo_bloqueo,
        titulo: `Bloqueada: ${b.motivo || b.tipo_bloqueo}`,
      });
    }

    const grupos = new Map<string, FilaHab[]>();
    for (const h of c.habitaciones) {
      const nombre = h.tipoHabitacion?.nombre ?? 'Sin tipo';
      if (!grupos.has(nombre)) grupos.set(nombre, []);
      grupos.get(nombre)!.push({ hab: h, barras: barrasPorHab.get(h.id) ?? [] });
    }
    this.grupos = [...grupos.entries()].map(([tipo, filas]) => ({ tipo, filas }));

    this.totalHabitaciones = c.habitaciones.length;
    this.ocupacion = ocupadasPorDia.map((n) => ({ ocupadas: n, pct: this.totalHabitaciones ? Math.round((n / this.totalHabitaciones) * 100) : 0 }));
  }

  // ---------- navegación ----------
  mover(delta: number): void {
    this.desde = sumarDias(this.desde, delta * this.dias);
    this.cargar();
  }

  irAHoy(): void {
    this.desde = hoyISO();
    this.cargar();
  }

  cambiarFecha(v: string): void {
    if (!v) return;
    this.desde = v;
    this.cargar();
  }

  cambiarDias(n: string): void {
    this.dias = Number(n);
    this.cargar();
  }

  get rangoTexto(): string {
    const f = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${f.format(desdeISO(this.desde))} – ${f.format(desdeISO(sumarDias(this.desde, this.dias - 1)))}`;
  }

  // ---------- acciones ----------
  abrirReserva(b: Barra): void {
    if (b.codigo) this.router.navigate(['/admin/reservas'], { queryParams: { texto: b.codigo } });
  }

  nuevaReserva(h: HabCal, iso: string): void {
    if (!this.puedeReservar || iso < this.hoy) return;
    this.router.navigate(['/admin/nueva-reserva'], { queryParams: { habitacion: h.id, checkIn: iso } });
  }

  col(i: number): number {
    return i + 2; // la columna 1 es el nombre de la habitación
  }

  ocupacionClase(pct: number): string {
    return pct >= 90 ? 'alta' : pct >= 60 ? 'media' : pct > 0 ? 'baja' : '';
  }
}
