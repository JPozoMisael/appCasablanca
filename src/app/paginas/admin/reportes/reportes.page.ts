import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonChip, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  cashOutline,
  bedOutline,
  clipboardOutline,
  downloadOutline,
  calendarOutline,
  todayOutline,
  trendingUpOutline,
  statsChartOutline,
  businessOutline,
  informationCircleOutline, refreshOutline } from 'ionicons/icons';
import { ReportesService } from '@app/core/services/reportes.service';

type Tab = 'general' | 'ingresos' | 'ocupacion' | 'habitaciones';
type Periodo = 'hoy' | '7d' | '30d' | 'mes';

interface SeriePoint {
  label: string;
  value: number;
}

interface TopItem {
  name: string;
  value: number;
  category?: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonChip, IonLabel],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage implements OnInit {
  tab = signal<Tab>('general');
  periodo = signal<Periodo>('7d');
  loading = signal(true);

  // Datos reales desde la API
  kpiData = signal({ ingresos: 0, ocupacion: 0, reservas: 0, ticket: 0 });
  ingresosData = signal<SeriePoint[]>([]);
  ocupacionData = signal<SeriePoint[]>([]);
  topHabitacionesData = signal<TopItem[]>([]);

  // Computed para la vista
  kpi = computed(() => this.kpiData());
  
  resumen = computed(() => {
    const k = this.kpi();
    return [
      { label: 'Ingresos totales', value: `$${k.ingresos.toLocaleString()}` },
      { label: 'Ocupación promedio', value: `${k.ocupacion}%` },
      { label: 'Reservas realizadas', value: `${k.reservas}` },
      { label: 'Ticket promedio', value: `$${k.ticket}` },
    ];
  });

  ingresosSerie = computed(() => this.ingresosData());
  ocupacionSerie = computed(() => this.ocupacionData());
  topHabitaciones = computed(() => this.topHabitacionesData());

  maxIngresos = computed(() => Math.max(1, ...this.ingresosSerie().map(s => s.value)));
  maxOcupacion = computed(() => Math.max(1, ...this.ocupacionSerie().map(s => s.value)));

  constructor(private reportesService: ReportesService) {
    addIcons({downloadOutline,refreshOutline,calendarOutline,todayOutline,cashOutline,bedOutline,clipboardOutline,trendingUpOutline,statsChartOutline,businessOutline,informationCircleOutline,analyticsOutline});
  }

  ngOnInit() {
    this.cargarDatos();
  }

  private getFechasPorPeriodo(): { desde: string; hasta: string } {
    const hoy = new Date();
    const hasta = hoy.toISOString().split('T')[0];
    let desde = hoy;
    
    switch (this.periodo()) {
      case 'hoy':
        desde = hoy;
        break;
      case '7d':
        desde.setDate(hoy.getDate() - 7);
        break;
      case '30d':
        desde.setDate(hoy.getDate() - 30);
        break;
      case 'mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
    }
    
    return {
      desde: desde.toISOString().split('T')[0],
      hasta: hasta
    };
  }

  private calcularTicketPromedio(ingresos: number, reservas: number): number {
    if (reservas === 0) return 0;
    return Math.round(ingresos / reservas);
  }

  cargarDatos() {
    this.loading.set(true);
    const fechas = this.getFechasPorPeriodo();
    
    // Cargar ingresos
    this.reportesService.ingresos(fechas).subscribe({
      next: (data) => {
        if (data) {
          const ingresos = data.total || 0;
          this.kpiData.update(k => ({ ...k, ingresos }));
          // Transformar datos para la serie
          if (data.serie && Array.isArray(data.serie)) {
            this.ingresosData.set(data.serie);
          }
        }
      },
      error: (err) => console.error('Error ingresos:', err)
    });

    // Cargar ocupación
    this.reportesService.ocupacion(fechas).subscribe({
      next: (data) => {
        if (data) {
          const ocupacion = data.promedio || 0;
          this.kpiData.update(k => ({ ...k, ocupacion }));
          if (data.serie && Array.isArray(data.serie)) {
            this.ocupacionData.set(data.serie);
          }
        }
      },
      error: (err) => console.error('Error ocupación:', err)
    });

    // Cargar reservas
    this.reportesService.reservas(fechas).subscribe({
      next: (data) => {
        if (data) {
          const reservas = data.total || 0;
          this.kpiData.update(k => ({ 
            ...k, 
            reservas,
            ticket: this.calcularTicketPromedio(k.ingresos, reservas)
          }));
          
          // Cargar top habitaciones si está disponible
          if (data.topHabitaciones && Array.isArray(data.topHabitaciones)) {
            this.topHabitacionesData.set(data.topHabitaciones);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error reservas:', err);
        this.loading.set(false);
      }
    });
  }

  setTab(v: Tab) { this.tab.set(v); }
  
  setPeriodo(p: Periodo) { 
    this.periodo.set(p);
    this.cargarDatos();
  }

  exportResumenCSV() {
    const rows = [['Métrica', 'Valor'], ...this.resumen().map(r => [r.label, r.value])];
    this.downloadCSV(`reporte_resumen_${this.periodo()}.csv`, rows);
  }

  exportTopCSV() {
    const rows = [['Habitación', 'Categoría', 'Ingresos'], ...this.topHabitaciones().map(t => [t.name, t.category || '', String(t.value)])];
    this.downloadCSV(`reporte_top_habitaciones_${this.periodo()}.csv`, rows);
  }

  private downloadCSV(filename: string, rows: string[][]) {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  pct(value: number, max: number): number {
    return max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  }
}