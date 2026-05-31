import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonChip, IonContent, IonItem, IonLabel, IonInput, IonToggle, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  settingsOutline, 
  saveOutline, 
  businessOutline, 
  notificationsOutline, 
  peopleOutline, 
  lockClosedOutline, 
  cashOutline, 
  calendarOutline,
  closeOutline,
  checkmarkOutline,
  chevronUpOutline,
  chevronDownOutline,
  refreshOutline
} from 'ionicons/icons';
import { ConfiguracionService, ConfiguracionItem } from '@app/core/services/configuracion.service';

interface SeccionConfig {
  icon: string;
  title: string;
  description: string;
  items: ConfiguracionItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonIcon, 
    IonButton, 
    IonChip, 
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonToggle,
    IonSelect,
    IonSelectOption
  ],
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {
  loading = signal(true);
  saving = signal(false);
  secciones = signal<SeccionConfig[]>([]);
  hasChanges = signal(false);
  
  editedValues: Map<string, any> = new Map();

  constructor(private configService: ConfiguracionService) {
    addIcons({
      settingsOutline,
      saveOutline,
      businessOutline,
      notificationsOutline,
      peopleOutline,
      lockClosedOutline,
      cashOutline,
      calendarOutline,
      closeOutline,
      checkmarkOutline,
      chevronUpOutline,
      chevronDownOutline,
      refreshOutline
    });
  }

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    this.loading.set(true);
    this.configService.getAll().subscribe({
      next: (items) => {
        this.organizarPorSecciones(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargar configuraciones:', err);
        this.loading.set(false);
      }
    });
  }

  private organizarPorSecciones(items: ConfiguracionItem[]) {
    const hotelItems = items.filter(i => i.clave.startsWith('hotel_'));
    const impuestosItems = items.filter(i => i.clave.startsWith('impuesto_') || i.clave === 'moneda');
    const horariosItems = items.filter(i => i.clave === 'checkin_hora' || i.clave === 'checkout_hora');
    
    const seccionesList: SeccionConfig[] = [
      {
        icon: 'business-outline',
        title: 'Datos del hotel',
        description: 'Nombre, dirección, teléfono, email',
        items: hotelItems,
        expanded: true
      },
      {
        icon: 'cash-outline',
        title: 'Moneda e impuestos',
        description: 'Configuración de precios e IVA',
        items: impuestosItems,
        expanded: false
      },
      {
        icon: 'calendar-outline',
        title: 'Horarios',
        description: 'Horarios de check-in y check-out',
        items: horariosItems,
        expanded: false
      }
    ];

    this.secciones.set(seccionesList);
  }

  getItemValue(item: ConfiguracionItem): any {
    if (this.editedValues.has(item.clave)) {
      return this.editedValues.get(item.clave);
    }
    return item.valor;
  }

  onValueChange(item: ConfiguracionItem, value: any) {
    this.editedValues.set(item.clave, value);
    this.hasChanges.set(true);
  }

  toggleSeccion(seccion: SeccionConfig) {
    seccion.expanded = !seccion.expanded;
    this.secciones.set([...this.secciones()]);
  }

  formatLabel(clave: string): string {
    const map: Record<string, string> = {
      'hotel_nombre': 'Nombre del hotel',
      'hotel_telefono': 'Teléfono',
      'hotel_email': 'Correo electrónico',
      'hotel_direccion': 'Dirección',
      'impuesto_porcentaje': 'Porcentaje de impuesto (IVA)',
      'moneda': 'Moneda',
      'checkin_hora': 'Hora de check-in',
      'checkout_hora': 'Hora de check-out'
    };
    return map[clave] || clave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getItemDescription(clave: string): string {
    const map: Record<string, string> = {
      'hotel_nombre': 'Nombre que aparecerá en facturas y comunicaciones',
      'impuesto_porcentaje': 'Porcentaje de impuesto aplicado a las reservas',
      'checkin_hora': 'Hora a partir de la cual se puede hacer check-in',
      'checkout_hora': 'Hora límite para realizar check-out'
    };
    return map[clave] || '';
  }

  getSelectOptions(clave: string): { value: string; label: string }[] | null {
    if (clave === 'moneda') {
      return [
        { value: 'USD', label: 'Dólar estadounidense (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' }
      ];
    }
    return null;
  }

  guardarCambios() {
    if (!this.hasChanges()) return;
    
    this.saving.set(true);
    const updates: { clave: string; valor: any }[] = [];
    
    this.editedValues.forEach((valor, clave) => {
      updates.push({ clave, valor });
    });
    
    this.configService.updateMultiple(updates).subscribe({
      next: (success) => {
        if (success) {
          this.editedValues.clear();
          this.hasChanges.set(false);
          this.cargarConfiguraciones();
          alert('Configuración guardada correctamente');
        } else {
          alert('Error al guardar la configuración');
        }
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error guardar:', err);
        alert('Error al guardar la configuración');
        this.saving.set(false);
      }
    });
  }

  cancelarCambios() {
    this.editedValues.clear();
    this.hasChanges.set(false);
    this.cargarConfiguraciones();
  }
}