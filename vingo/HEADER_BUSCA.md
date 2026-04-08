# Header com Busca - Documentação

## 🎨 Novo Design do Header

O header foi redesenhado para ter um layout mais limpo e funcional:

```
[Logo Vingo]  [━━━━━━━━━━ Busca ━━━━━━━━━━]  [Usuário] [Meus Ingressos] [Sair]
```

### Layout

**Estrutura:**
- **Esquerda**: Logo Vingo (clicável para home)
- **Centro**: Campo de busca expansível
- **Direita**: Informações do usuário e ações

**Sem container:**
- O header agora usa `px-6` diretamente, sem container
- Ocupa toda a largura da tela
- Elementos distribuídos com `justify-between`

## 🔍 Campo de Busca

### Características

**Visual:**
- Fundo: `bg-gray-800/50` (semi-transparente)
- Borda: `border-gray-700`
- Ícone de lupa à esquerda
- Botão X para limpar à direita (aparece quando há texto)
- Placeholder: "Buscar eventos por nome, local ou tipo..."

**Funcionalidade:**
- Input com two-way binding: `[(ngModel)]="searchQuery"`
- Evento `(input)` chama `onSearch()`
- Botão X chama `clearSearch()`
- Focus ring verde (#10B981)

### Código

```typescript
searchQuery = '';

onSearch() {
  if (this.searchQuery.trim()) {
    console.log('Buscando por:', this.searchQuery);
    // Implementar lógica de busca aqui
  }
}

clearSearch() {
  this.searchQuery = '';
}
```

## 📱 Responsividade

### Desktop (> 768px)
- Logo + nome "Vingo" visível
- Campo de busca com largura máxima de 2xl (max-w-2xl)
- Nome do usuário visível
- Texto "Sair" visível
- Botão "Meus Ingressos" visível

### Tablet (640px - 768px)
- Logo + nome "Vingo" visível
- Campo de busca reduzido
- Nome do usuário visível
- Texto "Sair" visível
- Botão "Meus Ingressos" visível

### Mobile (< 640px)
- Logo + nome "Vingo" visível
- Campo de busca ocupa espaço disponível
- Nome do usuário oculto (só ícone)
- Texto "Sair" oculto (só ícone)
- Botão "Meus Ingressos" oculto

## 🎯 Implementação Futura da Busca

### Opção 1: Filtrar Eventos na Página Atual

```typescript
// No header.ts
import { EventService } from '../../services/event.service';

onSearch() {
  if (this.searchQuery.trim()) {
    this.eventService.filterEvents(this.searchQuery);
  }
}

// No event.service.ts
private eventsSubject = new BehaviorSubject<Event[]>([]);
public events$ = this.eventsSubject.asObservable();

filterEvents(query: string) {
  const filtered = this.allEvents.filter(event => 
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.location.toLowerCase().includes(query.toLowerCase()) ||
    event.category.toLowerCase().includes(query.toLowerCase())
  );
  this.eventsSubject.next(filtered);
}
```

### Opção 2: Navegar para Página de Resultados

```typescript
onSearch() {
  if (this.searchQuery.trim()) {
    this.router.navigate(['/busca'], { 
      queryParams: { q: this.searchQuery } 
    });
  }
}

// Criar componente SearchResultsComponent
// Rota: /busca?q=termo
```

### Opção 3: Buscar no Firebase

```typescript
async onSearch() {
  if (this.searchQuery.trim()) {
    const results = await this.firebaseService.searchEvents(this.searchQuery);
    // Exibir resultados
  }
}

// No firebase.service.ts
async searchEvents(query: string): Promise<Event[]> {
  const q = query.toLowerCase();
  const eventsRef = collection(db, 'events');
  const querySnapshot = await getDocs(eventsRef);
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Event))
    .filter(event => 
      event.title.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q) ||
      event.description?.toLowerCase().includes(q)
    );
}
```

## 🎨 Cores Atualizadas

**Verde principal:** `#10B981` (mais forte e legível)

Aplicado em:
- Logo background
- Botões principais
- Focus ring do input de busca
- Ícone do usuário
- Botão "Meus Ingressos"

## 🔧 Melhorias Implementadas

### Removido
- ❌ Links de navegação (Eventos, Como Funciona, Ajuda)
- ❌ Container mx-auto (agora full width)

### Adicionado
- ✅ Campo de busca centralizado
- ✅ Ícone de lupa
- ✅ Botão para limpar busca
- ✅ Placeholder descritivo
- ✅ `whitespace-nowrap` nos botões para evitar quebra

### Melhorado
- ✅ Layout mais limpo e profissional
- ✅ Melhor uso do espaço horizontal
- ✅ Foco na funcionalidade principal (busca)
- ✅ Cores mais fortes e legíveis

## 📝 Exemplo de Uso

### Buscar Eventos

```typescript
// Usuário digita "São Paulo"
searchQuery = "São Paulo"

// Sistema pode:
1. Filtrar eventos que acontecem em São Paulo
2. Buscar eventos com "São Paulo" no título
3. Mostrar resultados em tempo real
```

### Limpar Busca

```typescript
// Usuário clica no X
clearSearch() // searchQuery = ''
// Mostra todos os eventos novamente
```

## 🚀 Próximos Passos

1. **Implementar lógica de busca real**
   - Decidir entre filtro local ou busca no Firebase
   - Criar página de resultados ou filtrar in-place

2. **Adicionar autocomplete**
   - Sugestões enquanto digita
   - Histórico de buscas

3. **Filtros avançados**
   - Por data
   - Por faixa de preço
   - Por categoria

4. **Busca por voz**
   - Botão de microfone
   - Speech-to-text API

5. **Analytics**
   - Rastrear termos mais buscados
   - Melhorar sugestões baseado em dados

## 💡 Dicas

- O campo de busca é totalmente funcional, só falta conectar com os dados
- Use debounce para evitar muitas requisições enquanto o usuário digita
- Considere adicionar loading state durante a busca
- Mantenha o histórico de buscas no localStorage
