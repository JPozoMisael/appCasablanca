import { Component, computed, signal } from '@angular/core';
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
  informationCircleOutline
} from 'ionicons/icons';

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
export class ReportesPage {
  tab = signal<Tab>('general');
  periodo = signal<Periodo>('7d');

  kpi = computed(() => {
    switch (this.periodo()) {
      case 'hoy': return { ingresos: 180, ocupacion: 62, reservas: 5, ticket: 36 };
      case '7d': return { ingresos: 2840, ocupacion: 71, reservas: 38, ticket: 75 };
      case '30d': return { ingresos: 11840, ocupacion: 66, reservas: 142, ticket: 83 };
      case 'mes': return { ingresos: 9240, ocupacion: 69, reservas: 110, ticket: 84 };
      default: return { ingresos: 0, ocupacion: 0, reservas: 0, ticket: 0 };
    }
  });

  resumen = computed(() => {
    const k = this.kpi();
    return [
      { label: 'Ingresos totales', value: `$${k.ingresos.toLocaleString()}` },
      { label: 'Ocupación promedio', value: `${k.ocupacion}%` },
      { label: 'Reservas realizadas', value: `${k.reservas}` },
      { label: 'Ticket promedio', value: `$${k.ticket}` },
    ];
  });

  ingresosSerie = computed<SeriePoint[]>(() => {
    const p = this.periodo();
    if (p === 'hoy') return [{ label: 'Hoy', value: 180 }];
    if (p === 'mes') {
      return [
        { label: '1', value: 280 }, { label: '5', value: 840 }, { label: '10', value: 660 },
        { label: '15', value: 920 }, { label: '20', value: 710 }, { label: '25', value: 1050 },
        { label: '30', value: 880 }
      ];
    }
    return [
      { label: 'Lun', value: 320 }, { label: 'Mar', value: 410 }, { label: 'Mié', value: 260 },
      { label: 'Jue', value: 520 }, { label: 'Vie', value: 610 }, { label: 'Sáb', value: 430 },
      { label: 'Dom', value: 290 }
    ];
  });

  ocupacionSerie = computed<SeriePoint[]>(() => {
    if (this.periodo() === 'hoy') return [{ label: 'Hoy', value: 62 }];
    return [
      { label: 'Lun', value: 64 }, { label: 'Mar', value: 70 }, { label: 'Mié', value: 68 },
      { label: 'Jue', value: 73 }, { label: 'Vie', value: 78 }, { label: 'Sáb', value: 74 },
      { label: 'Dom', value: 69 }
    ];
  });

  topHabitaciones = computed<TopItem[]>(() => {
    const p = this.periodo();
    if (p === 'hoy') {
      return [
        { name: 'Suite Presidencial', value: 95, category: '301' },
        { name: 'Doble Deluxe', value: 60, category: '204' },
        { name: 'Doble Estándar', value: 25, category: '210' }
      ];
    }
    return [
      { name: 'Suite Presidencial', value: 1480, category: '301' },
      { name: 'Doble Deluxe', value: 1220, category: '204' },
      { name: 'Suite Ejecutiva', value: 980, category: '303' },
      { name: 'Doble Estándar', value: 860, category: '210' },
      { name: 'Simple Premium', value: 740, category: '105' }
    ];
  });

  maxIngresos = computed(() => Math.max(1, ...this.ingresosSerie().map(s => s.value)));
  maxOcupacion = computed(() => Math.max(1, ...this.ocupacionSerie().map(s => s.value)));

  constructor() {
    addIcons({
      analyticsOutline, cashOutline, bedOutline, clipboardOutline, downloadOutline,
      calendarOutline, todayOutline, trendingUpOutline, statsChartOutline, businessOutline,
      informationCircleOutline
    });
  }

  setTab(v: Tab) { this.tab.set(v); }
  setPeriodo(p: Periodo) { this.periodo.set(p); }

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