import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'evento/:id',
    renderMode: RenderMode.Server // SSR para rotas dinâmicas
  },
  {
    path: 'evento/:id/ingressos',
    renderMode: RenderMode.Server // SSR para rotas dinâmicas
  },
  {
    path: 'meus-ingressos',
    renderMode: RenderMode.Server // SSR porque depende de autenticação
  },
  {
    path: 'pagamento',
    renderMode: RenderMode.Server // SSR porque depende de autenticação
  },
  {
    path: 'validar-voucher',
    renderMode: RenderMode.Server // SSR porque depende de autenticação
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender // Fallback para outras rotas
  }
];
