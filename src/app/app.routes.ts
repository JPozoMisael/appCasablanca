import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // PUBLIC LAYOUT
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component')
        .then((m) => m.PublicLayoutComponent),

    children: [

      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      {
        path: 'inicio',
        loadComponent: () =>
          import('./paginas/public/inicio/inicio.page')
            .then((m) => m.InicioPage),
      },

      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./paginas/public/habitaciones/habitaciones.page')
            .then((m) => m.HabitacionesPage),
      },

      {
        path: 'habitacion-detalle/:id',
        loadComponent: () =>
          import('./paginas/public/habitacion-detalle/habitacion-detalle.page')
            .then((m) => m.HabitacionDetallePage),
      },

      {
        path: 'login',
        loadComponent: () =>
          import('./paginas/public/login/login.page')
            .then((m) => m.LoginPage),
      },

      {
        path: 'registro',
        loadComponent: () =>
          import('./paginas/public/registro/registro.page')
            .then((m) => m.RegistroPage),
      },

      {
        path: 'reservar',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/public/reservar/reservar.page')
            .then((m) => m.ReservarPage),
      },

      {
        path: 'mis-reservas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/public/mis-reservas/mis-reservas.page')
            .then((m) => m.MisReservasPage),
      },

      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./paginas/public/perfil/perfil.page')
            .then((m) => m.PerfilPage),
      },

    ],
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component')
        .then((m) => m.AdminLayoutComponent),

    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./paginas/admin/dashboard/dashboard.page')
            .then((m) => m.DashboardPage),
      },

      {
        path: 'calendario',
        loadComponent: () =>
          import('./paginas/admin/calendario/calendario.page')
            .then((m) => m.CalendarioPage),
      },

      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./paginas/admin/habitaciones/habitaciones.page')
            .then((m) => m.AdminHabitacionesPage),
      },

      {
        path: 'huespedes',
        loadComponent: () =>
          import('./paginas/admin/huespedes/huespedes.page')
            .then((m) => m.AdminHuespedesPage),
      },

      {
        path: 'reservas',
        loadComponent: () =>
          import('./paginas/admin/reservas/reservas.page')
            .then((m) => m.AdminReservasPage),
      },

      // 🔑 SOLO ADMIN Y GERENCIA
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENCIA'] },
        loadComponent: () =>
          import('./paginas/admin/usuarios/usuarios.page')
            .then((m) => m.AdminUsuariosPage),
      },

      {
        path: 'reportes',
        loadComponent: () =>
          import('./paginas/admin/reportes/reportes.page')
            .then((m) => m.ReportesPage),
      },

    ],
  },

  {
    path: '**',
    redirectTo: 'inicio',
  },

];