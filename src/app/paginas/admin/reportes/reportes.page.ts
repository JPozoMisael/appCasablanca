import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonIcon,
  IonButton,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonLabel, 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  cashOutline,
  bedOutline,
  clipboardOutline,
  downloadOutline,
  calendarOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons';

type Tab = 'general' | 'ingresos' | 'ocupacion';
type Periodo = 'hoy' | '7d' | '30d' | 'mes';

interface SeriePoint {
  label: string;
  value: number;
}

interface TopItem {
  name: string;
  value: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonButton,
    IonChip,
    IonSegment,
    IonSegmentButton,
    IonLabel, 
  ],
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage {
  tab = signal<Tab>('general');
  periodo = signal<Periodo>('7d');

  kpi = computed(() => {
    switch (this.periodo()) {
      case 'hoy':
        return { ingresos: 180, ocupacion: 62, reservas: 5, ticket: 36 };
      case '7d':
        return { ingresos: 2840, ocupacion: 71, reservas: 38, ticket: 75 };
      case '30d':
        return { ingresos: 11840, ocupacion: 66, reservas: 142, ticket: 83 };
      case 'mes':
      default:
        return { ingresos: 9240, ocupacion: 69, reservas: 110, ticket: 84 };
    }
  });

  ingresosSerie = computed<SeriePoint[]>(() => {
    const p = this.periodo();
    if (p === 'hoy') return [{ label: 'Hoy', value: 180 }];
    if (p === 'mes') {
      return [
        { label: '1', value: 280 },
        { label: '5', value: 840 },
        { label: '10', value: 660 },
        { label: '15', value: 920 },
        { label: '20', value: 710 },
        { label: '25', value: 1050 },
        { label: '30', value: 880 },
      ];
    }
    return [
      { label: 'Lun', value: 320 },
      { label: 'Mar', value: 410 },
      { label: 'Mié', value: 260 },
      { label: 'Jue', value: 520 },
      { label: 'Vie', value: 610 },
      { label: 'Sáb', value: 430 },
      { label: 'Dom', value: 290 },
    ];
  });

  ocupacionSerie = computed<SeriePoint[]>(() => {
    const p = this.periodo();
    if (p === 'hoy') return [{ label: 'Hoy', value: 62 }];
    return [
      { label: 'Lun', value: 64 },
      { label: 'Mar', value: 70 },
      { label: 'Mié', value: 68 },
      { label: 'Jue', value: 73 },
      { label: 'Vie', value: 78 },
      { label: 'Sáb', value: 74 },
      { label: 'Dom', value: 69 },
    ];
  });

  resumen = computed(() => {
    const k = this.kpi();
    return [
      { label: 'Ingresos', value: `$${k.ingresos}` },
      { label: 'Ocupación', value: `${k.ocupacion}%` },
      { label: 'Reservas', value: `${k.reservas}` },
      { label: 'Ticket promedio', value: `$${k.ticket}` },
    ];
  });

  topHabitaciones = computed<TopItem[]>(() => {
    const p = this.periodo();
    if (p === 'hoy') {
      return [
        { name: 'Suite · 301', value: 95 },
        { name: 'Doble · 204', value: 60 },
        { name: 'Doble · 210', value: 25 },
      ];
    }
    return [
      { name: 'Suite · 301', value: 1480 },
      { name: 'Doble · 204', value: 1220 },
      { name: 'Suite · 303', value: 980 },
      { name: 'Doble · 210', value: 860 },
      { name: 'Simple · 105', value: 740 },
    ];
  });

  constructor() {
    addIcons({
      analyticsOutline,
      cashOutline,
      bedOutline,
      clipboardOutline,
      downloadOutline,
      calendarOutline,
      timeOutline,
      trendingUpOutline,
    });
  }

  setTab(v: any) {
    this.tab.set((v || 'general') as Tab);
  }

  setPeriodo(p: Periodo) {
    this.periodo.set(p);
  }

  exportResumenCSV() {
    const rows = [['Métrica', 'Valor'], ...this.resumen().map(r => [r.label, r.value])];
    this.downloadCSV(`reporte_resumen_${this.periodo()}.csv`, rows);
  }

  exportTopCSV() {
    const rows = [['Habitación', 'Ingresos'], ...this.topHabitaciones().map(t => [t.name, String(t.value)])];
    this.downloadCSV(`reporte_top_habitaciones_${this.periodo()}.csv`, rows);
  }

  private downloadCSV(filename: string, rows: string[][]) {
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  maxSerie(serie: SeriePoint[]): number {
    return Math.max(1, ...serie.map(s => s.value));
  }

  pct(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }
}
