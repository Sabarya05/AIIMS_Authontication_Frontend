import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentAdmin = authService.currentAdminValue;
  
  if (currentAdmin && currentAdmin.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentAdmin.token}`
      }
    });
  }
  
  return next(req);
};