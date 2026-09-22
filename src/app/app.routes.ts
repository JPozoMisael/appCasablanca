import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { menuGuard } from './core/guards/role.guard';

export const routes: Routes = [
  /* =====================================================
     SITIO PÚBLICO (marketplace)
  ===================================================== */
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        title: 'Salinas Booking · Hoteles y alojamientos en Salinas',
        loadComponent: () => import('./paginas/public/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'buscar',
        title: 'Alojamientos en Salinas · Salinas Booking',
        loadComponent: () => import('./paginas/public/buscar/buscar.page').then((m) => m.BuscarPage),
      },
      {
        path: 'hotel/:slug',
        title: 'Alojamiento · Salinas Booking',
        loadComponent: () => import('./paginas/public/hotel/hotel.page').then((m) => m.HotelPage),
      },
      // Rutas antiguas del sistema de un solo hotel
      { path: 'hotel/:slug/habitaciones', redirectTo: 'hotel/:slug' },
      { path: 'hotel/:slug/habitacion/:id', redirectTo: 'hotel/:slug' },
      {
        path: 'reservar',
        title: 'Confirmar reserva · Salinas Booking',
        loadComponent: () => import('./paginas/public/reservar/reservar.page').then((m) => m.ReservarPage),
      },
      {
        path: 'reserva-confirmada',
        title: 'Reserva confirmada · Salinas Booking',
        loadComponent: () =>
          import('./paginas/public/reserva-confirmada/reserva-confirmada.page').then((m) => m.ReservaConfirmadaPage),
      },
      {
        path: 'consultar-reserva',
        title: 'Consultar reserva · Salinas Booking',
        loadComponent: () =>
          import('./paginas/public/consultar-reserva/consultar-reserva.page').then((m) => m.ConsultarReservaPage),
      },
      {
        path: 'login',
        title: 'Iniciar sesión · Salinas Booking',
        loadComponent: () => import('./paginas/public/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'registro',
        title: 'Crear cuenta · Salinas Booking',
        loadComponent: () => import('./paginas/public/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'mis-reservas',
        title: 'Mis reservas · Salinas Booking',
        canActivate: [authGuard],
        loadComponent: () => import('./paginas/public/mis-reservas/mis-reservas.page').then((m) => m.MisReservasPage),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Salinas Booking',
        canActivate: [authGuard],
        loadComponent: () => import('./paginas/public/perfil/perfil.page').then((m) => m.PerfilPage),
      },
    ],
  },

  /* =====================================================
     PANEL DE GESTIÓN (personal del hotel y plataforma)
  ===================================================== */
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Cada página exige que su ruta esté en el menú del usuario (definido en la base de datos).
      {
        path: 'dashboard',
        title: 'Resumen · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'calendario',
        title: 'Calendario · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/calendario/calendario.page').then((m) => m.CalendarioPage),
      },
      {
        path: 'nueva-reserva',
        title: 'Nueva reserva · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/nueva-reserva/nueva-reserva.page').then((m) => m.NuevaReservaPage),
      },
      {
        path: 'reservas',
        title: 'Reservas · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/reservas/reservas.page').then((m) => m.AdminReservasPage),
      },
      {
        path: 'habitaciones',
        title: 'Habitaciones · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/habitaciones/habitaciones.page').then((m) => m.AdminHabitacionesPage),
      },
      {
        path: 'tarifas',
        title: 'Tarifas · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/tarifas/tarifas.page').then((m) => m.TarifasPage),
      },
      {
        path: 'servicios',
        title: 'Servicios · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/servicios/servicios.page').then((m) => m.ServiciosPage),
      },
      {
        path: 'usuarios',
        title: 'Personal · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/usuarios/usuarios.page').then((m) => m.AdminUsuariosPage),
      },
      {
        path: 'canales',
        title: 'Canales de venta · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/canales/canales.page').then((m) => m.CanalesPage),
      },
      {
        path: 'mi-hotel',
        title: 'Mi alojamiento · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/mi-hotel/mi-hotel.page').then((m) => m.MiHotelPage),
      },
      {
        path: 'hoteles',
        title: 'Alojamientos · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/hoteles/hoteles.page').then((m) => m.HotelesPage),
      },
      {
        path: 'roles',
        title: 'Roles y permisos · Panel',
        canActivate: [menuGuard],
        loadComponent: () => import('./paginas/admin/roles/roles.page').then((m) => m.RolesPage),
      },
    ],
  },

  { path: '**', redirectTo: 'inicio' },
];
