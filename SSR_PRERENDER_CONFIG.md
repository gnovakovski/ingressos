# Configuração SSR vs Prerender - Angular

## Problema Resolvido

**Erro:** `The 'evento/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing`

**Causa:** Tentativa de pré-renderizar rotas dinâmicas sem especificar quais parâmetros usar.

## Solução Implementada

Configuramos diferentes modos de renderização para cada tipo de rota:

### Rotas com Prerender (Estáticas)
```typescript
{
  path: '',
  renderMode: RenderMode.Prerender
}
```

**Quando usar:**
- Páginas estáticas (home, login, register)
- Conteúdo que não muda frequentemente
- Páginas sem parâmetros dinâmicos

**Vantagens:**
- HTML gerado em build time
- Carregamento instantâneo
- Melhor SEO
- Menor carga no servidor

### Rotas com SSR (Dinâmicas)
```typescript
{
  path: 'evento/:id',
  renderMode: RenderMode.Server
}
```

**Quando usar:**
- Rotas com parâmetros dinâmicos (`:id`)
- Conteúdo que depende de autenticação
- Dados que mudam frequentemente
- Conteúdo do Firebase/Firestore

**Vantagens:**
- Renderizado sob demanda
- Sempre atualizado
- Funciona com dados dinâmicos
- Não precisa de `getPrerenderParams`

## Configuração Atual

### src/app/app.routes.server.ts

```typescript
export const serverRoutes: ServerRoute[] = [
  // Páginas estáticas - Prerender
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
  
  // Páginas dinâmicas - SSR
  {
    path: 'evento/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'evento/:id/ingressos',
    renderMode: RenderMode.Server
  },
  {
    path: 'meus-ingressos',
    renderMode: RenderMode.Server
  },
  {
    path: 'pagamento',
    renderMode: RenderMode.Server
  },
  {
    path: 'validar-voucher',
    renderMode: RenderMode.Server
  },
  
  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
```

## Alternativa: Prerender com getPrerenderParams

Se você quiser pré-renderizar as páginas de eventos (para melhor SEO), pode usar:

```typescript
import { EventService } from './services/event.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'evento/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const eventService = new EventService();
      const events = await eventService.getAllEvents();
      
      // Retornar array de parâmetros para pré-renderizar
      return events.map(event => ({ id: event.id }));
    }
  }
];
```

**Desvantagens desta abordagem:**
- Precisa buscar todos os eventos no build time
- Aumenta o tempo de build
- Páginas ficam desatualizadas até o próximo deploy
- Não funciona bem com Firebase (precisa de credenciais no build)

## Recomendação

Para aplicações com Firebase/Firestore e conteúdo dinâmico, **use SSR (RenderMode.Server)** para:
- Rotas com parâmetros dinâmicos
- Páginas que dependem de autenticação
- Conteúdo que muda frequentemente

Use **Prerender (RenderMode.Prerender)** apenas para:
- Páginas completamente estáticas
- Landing pages
- Páginas de login/registro

## Deploy na Vercel

A configuração atual funciona perfeitamente na Vercel porque:
1. Páginas estáticas são pré-renderizadas no build
2. Páginas dinâmicas usam Edge Functions (SSR)
3. Não há necessidade de configuração adicional

## Performance

### Prerender
- ⚡ Carregamento instantâneo
- 📦 HTML estático servido do CDN
- 🎯 Ideal para SEO

### SSR
- 🔄 Renderizado sob demanda
- 📊 Sempre atualizado
- 🔐 Suporta autenticação
- 🌐 Funciona com dados dinâmicos

## Testes

Após o deploy, verifique:

1. **Página Home** (Prerender)
   - View Source deve mostrar HTML completo
   - Carregamento instantâneo

2. **Página de Evento** (SSR)
   - View Source deve mostrar HTML do evento específico
   - Dados atualizados do Firebase

3. **Meus Ingressos** (SSR)
   - Requer autenticação
   - Dados específicos do usuário

## Logs de Build

No build, você verá:

```
✓ Prerendering 3 static pages
  ✓ /
  ✓ /register
  ✓ /login

✓ Server routes configured for SSR
  ✓ /evento/:id
  ✓ /evento/:id/ingressos
  ✓ /meus-ingressos
  ✓ /pagamento
  ✓ /validar-voucher
```

## Troubleshooting

### Erro: "getPrerenderParams is missing"
**Solução:** Mude para `RenderMode.Server`

### Erro: "Cannot read properties of undefined"
**Solução:** Verifique se os dados do Firebase estão disponíveis no SSR

### Página em branco no SSR
**Solução:** Verifique se o Firebase está configurado corretamente no servidor

## Referências

- [Angular SSR Documentation](https://angular.dev/guide/ssr)
- [Vercel Angular Deployment](https://vercel.com/docs/frameworks/angular)
- [RenderMode API](https://angular.dev/api/ssr/RenderMode)
