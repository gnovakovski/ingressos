# Correções SSR - Build na Vercel

## Problema

```
Application bundle generation failed.
```

O build estava falhando porque havia código que tentava acessar APIs do browser (window, localStorage, sessionStorage) durante o Server-Side Rendering, onde essas APIs não existem.

## Causa Raiz

No SSR, o código Angular roda no servidor Node.js, que não tem acesso a:
- `window` object
- `localStorage`
- `sessionStorage`
- `document`
- Outras APIs do browser

## Correções Aplicadas

### 1. Header Component (window.location)

**Antes:**
```typescript
async logout() {
  await this.authService.logout();
  window.location.href = '/'; // ❌ Erro no SSR
}
```

**Depois:**
```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

private platformId = inject(PLATFORM_ID);

async logout() {
  await this.authService.logout();
  // Verificar se está no browser antes de usar window
  if (isPlatformBrowser(this.platformId)) {
    window.location.href = '/';
  } else {
    this.router.navigate(['/']);
  }
}
```

### 2. Payment Component (sessionStorage)

**Antes:**
```typescript
ngOnInit() {
  const ticketsData = sessionStorage.getItem('selectedTickets'); // ❌ Erro no SSR
  // ...
}
```

**Depois:**
```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

private platformId = inject(PLATFORM_ID);

ngOnInit() {
  if (!isPlatformBrowser(this.platformId)) {
    return; // Não executar no servidor
  }
  
  const ticketsData = sessionStorage.getItem('selectedTickets');
  // ...
}
```

**Também corrigido na limpeza:**
```typescript
setTimeout(() => {
  if (isPlatformBrowser(this.platformId)) {
    sessionStorage.removeItem('selectedTickets');
    sessionStorage.removeItem('eventId');
    sessionStorage.removeItem('eventTitle');
  }
  this.router.navigate(['/meus-ingressos']);
}, 2000);
```

## Arquivos Já Protegidos

Estes arquivos já tinham proteção SSR correta:

### AuthService
```typescript
private saveUserToStorage(user: User): void {
  if (!isPlatformBrowser(this.platformId)) return; // ✅
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedUser));
}
```

### TicketSelectionComponent
```typescript
private saveToLocalStorage(): void {
  if (!isPlatformBrowser(this.platformId)) return; // ✅
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
}
```

### AuthGuard
```typescript
if (isPlatformBrowser(platformId)) { // ✅
  sessionStorage.setItem('redirectUrl', state.url);
}
```

## Padrão de Proteção SSR

Para qualquer código que use APIs do browser:

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export class MyComponent {
  private platformId = inject(PLATFORM_ID);
  
  someMethod() {
    // Verificar se está no browser
    if (isPlatformBrowser(this.platformId)) {
      // Código que usa APIs do browser
      localStorage.setItem('key', 'value');
      window.location.href = '/';
      document.querySelector('.class');
    }
  }
}
```

## APIs que Precisam de Proteção

Sempre use `isPlatformBrowser` antes de acessar:

- `window.*`
- `document.*`
- `localStorage`
- `sessionStorage`
- `navigator`
- `location`
- `XMLHttpRequest`
- `fetch` (use HttpClient do Angular)
- Qualquer biblioteca que dependa do DOM

## Build e Deploy

Agora o build deve funcionar:

```bash
# Build local
npm run build

# Deve ver:
✔ Browser application bundle generation complete.
✔ Server application bundle generation complete.
✔ Prerendering 3 static pages
✔ Build complete
```

## Verificação

Após o deploy, teste:

1. **SSR funcionando:**
   - View Source da página deve mostrar HTML completo
   - Não deve ter erros no console do servidor

2. **Funcionalidades do browser:**
   - Login/Logout funcionando
   - localStorage salvando dados
   - Navegação funcionando

3. **Performance:**
   - Primeira renderização rápida (SSR)
   - Interatividade após hydration

## Logs Úteis

Durante o desenvolvimento, você pode adicionar logs para debug:

```typescript
if (isPlatformBrowser(this.platformId)) {
  console.log('🌐 Executando no browser');
} else {
  console.log('🖥️ Executando no servidor (SSR)');
}
```

## Próximos Passos

1. Commit das mudanças
2. Push para o repositório
3. Deploy automático na Vercel
4. Verificar logs de build
5. Testar aplicação em produção

```bash
git add .
git commit -m "fix: adicionar proteção SSR para window e sessionStorage"
git push
```

## Referências

- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [Platform Browser Check](https://angular.dev/api/common/isPlatformBrowser)
- [Vercel Angular SSR](https://vercel.com/docs/frameworks/angular)
