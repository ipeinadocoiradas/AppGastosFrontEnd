import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { errorMessage, errorTitle } from '../utils/problem-details.util';

/** Traduce los `ProblemDetails` de la API .NET a toasts y gestiona la caducidad de sesión. */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const isLogin = req.url.endsWith('/api/auth/login');
        if (error.status === 401 && !isLogin) {
          auth.logout();
          toastr.warning('Tu sesión ha caducado. Vuelve a iniciar sesión.', 'Sesión caducada');
        } else {
          toastr.error(errorMessage(error), errorTitle(error.status));
        }
      }
      return throwError(() => error);
    }),
  );
};
