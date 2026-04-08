import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser) {
    return true;
  }

  // Salvar a URL que o usuário tentou acessar
  sessionStorage.setItem('redirectUrl', state.url);
  
  // Redirecionar para login
  router.navigate(['/login']);
  return false;
};
