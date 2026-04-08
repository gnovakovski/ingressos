# Debug - Problema de Carregamento de Eventos

## 🐛 Problema

Ao clicar nos cards de eventos, a página fica travada no loading.

## ✅ Correções Aplicadas

### 1. Timeout Reduzido
- Antes: 500ms
- Agora: 300ms
- Carregamento mais rápido

### 2. Dados Mockados Completos
- Criados 6 eventos completos (IDs 1-6)
- Cada evento com dados reais
- Fallback para evento 1 se ID não existir

### 3. Logs de Debug Adicionados
```typescript
console.log('Event ID:', this.eventId);
console.log('Loading event...');
console.log('Event loaded:', this.event);
```

## 🔍 Como Verificar

### 1. Abra o Console do Navegador
- Pressione F12
- Vá na aba "Console"

### 2. Clique em um Evento
- Você deve ver:
  ```
  Event ID: 1
  Loading event...
  Event loaded: {id: '1', title: 'Festival...', ...}
  ```

### 3. Verifique a Página
- Deve carregar em menos de 1 segundo
- Imagem do evento deve aparecer
- Informações completas visíveis
- Botão "Selecionar Ingressos" funcional

## 🚨 Se Ainda Não Funcionar

### Verificar Rotas
```typescript
// app.routes.ts deve ter:
{
  path: 'evento/:id',
  component: EventDetailsComponent
}
```

### Verificar Navegação
```typescript
// events.ts deve ter:
navigateToEvent(eventId: number) {
  this.router.navigate(['/evento', eventId]);
}

// events.html deve ter:
<div (click)="navigateToEvent(event.id)">
```

### Limpar Cache
```bash
# Pare o servidor
Ctrl + C

# Limpe o cache
rm -rf .angular/cache

# Reinstale
npm install

# Inicie novamente
npm start
```

### Verificar Imports
```typescript
// event-details.ts deve importar:
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ... } from 'lucide-angular';
```

## 📊 Estrutura de Dados

Cada evento tem:
```typescript
{
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  address: string;
  imageUrl: string;
  availableTickets: number;
  ticketTypes: [
    {
      id: string;
      name: string;
      description: string;
      price: number;
      available: number;
    }
  ]
}
```

## 🎯 Eventos Disponíveis

1. **Festival Eletrônica 2026** (ID: 1)
   - São Paulo - SP
   - 15/05/2026
   - 3 tipos de ingresso

2. **Rock in Concert** (ID: 2)
   - Rio de Janeiro - RJ
   - 22/05/2026
   - 2 tipos de ingresso

3. **Festa Neon Night** (ID: 3)
   - Belo Horizonte - MG
   - 28/05/2026
   - 2 tipos de ingresso

4. **Stand-up Comedy Show** (ID: 4)
   - Curitiba - PR
   - 05/06/2026
   - 2 tipos de ingresso

5. **Tech Summit Brasil** (ID: 5)
   - São Paulo - SP
   - 10/06/2026
   - 2 tipos de ingresso

6. **Sertanejo Universitário** (ID: 6)
   - Goiânia - GO
   - 18/06/2026
   - 2 tipos de ingresso

## 🔄 Fluxo Esperado

1. **Usuário clica no card**
   - `navigateToEvent(1)` é chamado
   - Router navega para `/evento/1`

2. **EventDetailsComponent carrega**
   - `ngOnInit()` executa
   - `eventId` é extraído da URL
   - `loadEvent()` é chamado

3. **Dados são carregados**
   - `loading = true`
   - Timeout de 300ms
   - `getMockEvent(id)` retorna dados
   - `loading = false`

4. **Página renderiza**
   - Imagem aparece
   - Informações são exibidas
   - Botões ficam clicáveis

## 💡 Dicas

- Se o loading não parar, verifique o console
- Se aparecer erro 404, verifique as rotas
- Se a página ficar branca, verifique os imports
- Se os dados não aparecerem, verifique o HTML

## 🆘 Último Recurso

Se nada funcionar:

1. **Reinicie o servidor**
   ```bash
   Ctrl + C
   npm start
   ```

2. **Limpe tudo**
   ```bash
   rm -rf node_modules
   rm -rf .angular
   npm install
   npm start
   ```

3. **Verifique o navegador**
   - Limpe o cache (Ctrl + Shift + Delete)
   - Tente em modo anônimo
   - Tente outro navegador

4. **Verifique os arquivos**
   - `event-details.ts` existe?
   - `event-details.html` existe?
   - `app.routes.ts` tem a rota?
   - `events.ts` tem o método de navegação?
