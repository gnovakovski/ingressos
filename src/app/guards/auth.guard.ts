import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  console.log('🔐 AuthGuard: Verificando autenticação...');
  console.log('   - currentUser:', authService.currentUser?.email || 'null');

  // Verificação imediata
  if (authService.currentUser) {
    console.log('✅ AuthGuard: Usuário autenticado (imediato)');
    return true;
  }

  // Aguardar um pouco para o AuthService restaurar do localStorage
  console.log('⏳ AuthGuard: Aguardando restauração do localStorage...');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Verificar novamente
  if (authService.currentUser) {
    console.log('✅ AuthGuard: Usuário autenticado (após aguardar)');
    return true;
  }

  console.log('❌ AuthGuard: Usuário não autenticado, redirecionando para login');

  // Salvar a URL que o usuário tentou acessar (apenas no browser)
  if (isPlatformBrowser(platformId)) {
    sessionStorage.setItem('redirectUrl', state.url);
  }
  
  // Redirecionar para login
  router.navigate(['/login']);
  return false;
};
