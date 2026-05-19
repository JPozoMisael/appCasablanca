import { Routes } from '@angular/router';

import { authGuard }
  from './core/guards/auth.guard';

import { adminGuard }
  from './core/guards/admin.guard';

import { roleGuard }
  from './core/guards/role.guard';

export const routes: Routes = [

  // =====================================================
  // PUBLIC
  // =====================================================

  {
    path: '',

    loadComponent: async () => {

      console.log(
        '[ROUTE] Public Layout'
      );

      return import(
        './layouts/public-layout/public-layout.component'
      ).then(
        m => m.PublicLayoutComponent
      );
    },

    children: [

      // ===============================================
      // DEFAULT
      // ===============================================

      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },


      // ===============================================
      // INICIO
      // ===============================================

      {
        path: 'inicio',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Inicio'
          );

          return import(
            './paginas/public/inicio/inicio.page'
          ).then(
            m => m.InicioPage
          );
        },
      },


      // ===============================================
      // HOTEL
      // ===============================================

      {
        path: 'hotel/:slug',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Hotel'
          );

          return import(
            './paginas/public/hotel/hotel.page'
          ).then(
            m => m.HotelPage
          );
        },
      },


      // ===============================================
      // HABITACIONES
      // ===============================================

      {
        path: 'hotel/:slug/habitaciones',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Habitaciones Public'
          );

          return import(
            './paginas/public/habitaciones/habitaciones.page'
          ).then(
            m => m.HabitacionesPage
          );
        },
      },


      // ===============================================
      // DETALLE HABITACION
      // ===============================================

      {
        path: 'hotel/:slug/habitacion/:id',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Habitacion Detalle'
          );

          return import(
            './paginas/public/habitacion-detalle/habitacion-detalle.page'
          ).then(
            m => m.HabitacionDetallePage
          );
        },
      },


      // ===============================================
      // RESERVAR
      // ===============================================

      {
        path: 'reservar',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Reservar'
          );

          return import(
            './paginas/public/reservar/reservar.page'
          ).then(
            m => m.ReservarPage
          );
        },
      },


      // ===============================================
      // LOGIN
      // ===============================================

      {
        path: 'login',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Login'
          );

          return import(
            './paginas/public/login/login.page'
          ).then(
            m => m.LoginPage
          );
        },
      },


      // ===============================================
      // REGISTRO
      // ===============================================

      {
        path: 'registro',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Registro'
          );

          return import(
            './paginas/public/registro/registro.page'
          ).then(
            m => m.RegistroPage
          );
        },
      },


      // ===============================================
      // MIS RESERVAS
      // ===============================================

      {
        path: 'mis-reservas',

        canActivate: [
          authGuard
        ],

        loadComponent: async () => {

          console.log(
            '[ROUTE] Mis Reservas'
          );

          return import(
            './paginas/public/mis-reservas/mis-reservas.page'
          ).then(
            m => m.MisReservasPage
          );
        },
      },


      // ===============================================
      // PERFIL
      // ===============================================

      {
        path: 'perfil',

        canActivate: [
          authGuard
        ],

        loadComponent: async () => {

          console.log(
            '[ROUTE] Perfil'
          );

          return import(
            './paginas/public/perfil/perfil.page'
          ).then(
            m => m.PerfilPage
          );
        },
      },
    ],
  },


  // =====================================================
  // ADMIN
  // =====================================================

  {
    path: 'admin',

    canActivate: [
      authGuard,
      adminGuard
    ],

    loadComponent: async () => {

      console.log(
        '[ROUTE] Admin Layout'
      );

      return import(
        './layouts/admin-layout/admin-layout.component'
      ).then(
        m => m.AdminLayoutComponent
      );
    },

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },


      // ===============================================
      // DASHBOARD
      // ===============================================

      {
        path: 'dashboard',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Dashboard'
          );

          return import(
            './paginas/admin/dashboard/dashboard.page'
          ).then(
            m => m.DashboardPage
          );
        },
      },


      // ===============================================
      // CALENDARIO
      // ===============================================

      {
        path: 'calendario',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Calendario'
          );

          return import(
            './paginas/admin/calendario/calendario.page'
          ).then(
            m => m.CalendarioPage
          );
        },
      },


      // ===============================================
      // HABITACIONES ADMIN
      // ===============================================

      {
        path: 'habitaciones',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Habitaciones Admin'
          );

          return import(
            './paginas/admin/habitaciones/habitaciones.page'
          ).then(
            m => m.AdminHabitacionesPage
          );
        },
      },


      // ===============================================
      // HUESPEDES
      // ===============================================

      {
        path: 'huespedes',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Huespedes'
          );

          return import(
            './paginas/admin/huespedes/huespedes.page'
          ).then(
            m => m.AdminHuespedesPage
          );
        },
      },


      // ===============================================
      // RESERVAS ADMIN
      // ===============================================

      {
        path: 'reservas',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Reservas Admin'
          );

          return import(
            './paginas/admin/reservas/reservas.page'
          ).then(
            m => m.AdminReservasPage
          );
        },
      },


      // ===============================================
      // USUARIOS
      // ===============================================

      {
        path: 'usuarios',

        canActivate: [
          roleGuard
        ],

        data: {
          roles: [
            'super_admin',
            'admin'
          ]
        },

        loadComponent: async () => {

          console.log(
            '[ROUTE] Usuarios'
          );

          return import(
            './paginas/admin/usuarios/usuarios.page'
          ).then(
            m => m.AdminUsuariosPage
          );
        },
      },


      // ===============================================
      // REPORTES
      // ===============================================

      {
        path: 'reportes',

        loadComponent: async () => {

          console.log(
            '[ROUTE] Reportes'
          );

          return import(
            './paginas/admin/reportes/reportes.page'
          ).then(
            m => m.ReportesPage
          );
        },
      },
    ],
  },


  // =====================================================
  // RESERVA CONFIRMADA
  // =====================================================

  {
    path: 'reserva-confirmada',

    loadComponent: async () => {

      console.log(
        '[ROUTE] Reserva Confirmada'
      );

      return import(
        './paginas/public/reserva-confirmada/reserva-confirmada.page'
      ).then(
        m => m.ReservaConfirmadaPage
      );
    },
  },


  // =====================================================
  // FALLBACK
  // =====================================================

  {
    path: '**',
    redirectTo: 'inicio',
  },

];