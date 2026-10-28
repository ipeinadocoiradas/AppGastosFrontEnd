import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'movimientos' },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'bancos',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/configuracion/bancos/bancos.page').then((m) => m.BancosPage),
      },
      {
        path: 'tipos-cuenta',
        canActivate: [adminGuard],
        data: { titulo: 'Tipos de cuenta', entidad: 'tipo de cuenta', catalogo: 'tipos-cuenta' },
        loadComponent: () =>
          import('./features/configuracion/catalogo-simple/catalogo-simple.page').then(
            (m) => m.CatalogoSimplePage,
          ),
      },
      {
        path: 'categorias',
        canActivate: [adminGuard],
        data: { titulo: 'Categorías', entidad: 'categoría', catalogo: 'categorias' },
        loadComponent: () =>
          import('./features/configuracion/catalogo-simple/catalogo-simple.page').then(
            (m) => m.CatalogoSimplePage,
          ),
      },
      {
        path: 'cuentas',
        loadComponent: () =>
          import('./features/cuentas/cuentas.page').then((m) => m.CuentasPage),
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./features/movimientos/movimientos.page').then((m) => m.MovimientosPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
