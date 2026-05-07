import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // ================= PUBLIC =================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component')
        .then(m => m.PublicLayoutComponent),

    children: [

      // ================= DEFAULT =================
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },

      // ================= INICIO =================
      {
        path: 'inicio',
        loadComponent: () =>
          import('./paginas/public/inicio/inicio.page')
            .then(m => m.InicioPage),
      },

      // ================= HOTEL =================
      {
        path: 'hotel/:slug',
        loadComponent: () =>
          import('./paginas/public/hotel/hotel.page')
            .then(m => m.HotelPage),
      },

      // ================= HABITACIONES =================
      {
        path: 'hotel/:slug/habitaciones',
        loadComponent: () =>
          import('./paginas/public/habitaciones/habitaciones.page')
            .then(m => m.HabitacionesPage),
      },

      // ================= DETALLE HABITACIÓN =================
      {
        path: 'hotel/:slug/habitacion/:id',
        loadComponent: () =>
          import('./paginas/public/habitacion-detalle/habitacion-detalle.page')
            .then(m => m.HabitacionDetallePage),
      },

      // ================= RESERVAR =================
      // 🔥 SIN LOGIN (RECOMENDADO)
      {
        path: 'reservar',
        loadComponent: () =>
          import('./paginas/public/reservar/reservar.page')
            .then(m => m.ReservarPage),
      },

      // ================= LOGIN =================
      {
        path: 'login',
        loadComponent: () =>
          import('./paginas/public/login/login.page')
            .then(m => m.LoginPage),
      },

      // ================= REGISTRO =================
      {
        path: 'registro',
        loadComponent: () =>
          import('./paginas/public/registro/registro.page')
            .then(m => m.RegistroPage),
      },

      // ================= MIS RESERVAS =================
      {
        path: 'mis-reservas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/public/mis-reservas/mis-reservas.page')
            .then(m => m.MisReservasPage),
      },

      // ================= PERFIL =================
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/public/perfil/perfil.page')
            .then(m => m.PerfilPage),
      },

    ],
  },

  // ================= ADMIN =================
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],

    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ================= DASHBOARD =================
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./paginas/admin/dashboard/dashboard.page')
            .then(m => m.DashboardPage),
      },

      // ================= CALENDARIO =================
      {
        path: 'calendario',
        loadComponent: () =>
          import('./paginas/admin/calendario/calendario.page')
            .then(m => m.CalendarioPage),
      },

      // ================= HABITACIONES ADMIN =================
      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./paginas/admin/habitaciones/habitaciones.page')
            .then(m => m.AdminHabitacionesPage),
      },

      // ================= HUESPEDES =================
      {
        path: 'huespedes',
        loadComponent: () =>
          import('./paginas/admin/huespedes/huespedes.page')
            .then(m => m.AdminHuespedesPage),
      },

      // ================= RESERVAS ADMIN =================
      {
        path: 'reservas',
        loadComponent: () =>
          import('./paginas/admin/reservas/reservas.page')
            .then(m => m.AdminReservasPage),
      },

      // ================= USUARIOS =================
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: {
          roles: ['ADMIN', 'GERENCIA']
        },

        loadComponent: () =>
          import('./paginas/admin/usuarios/usuarios.page')
            .then(m => m.AdminUsuariosPage),
      },

      // ================= REPORTES =================
      {
        path: 'reportes',
        loadComponent: () =>
          import('./paginas/admin/reportes/reportes.page')
            .then(m => m.ReportesPage),
      },

    ],
  },

  // ================= RESERVA CONFIRMADA =================
  {
    path: 'reserva-confirmada',
    loadComponent: () =>
      import('./paginas/public/reserva-confirmada/reserva-confirmada.page')
        .then(m => m.ReservaConfirmadaPage),
  },

  // ================= FALLBACK =================
  {
    path: '**',
    redirectTo: 'inicio',
  },

];