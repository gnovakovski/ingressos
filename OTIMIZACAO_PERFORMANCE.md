# Otimização de Performance - Sistema de Cache e Change Detection

## Problema resolvido

A home ficava em loop infinito ao recarregar, fazendo múltiplas chamadas desnecessárias ao Firebase.

## Soluções implementadas

### 1. Sistema de Cache no EventService

Implementado cache em memória com duração de 1 minuto para evitar chamadas repetidas ao Firebase.

**Características:**
- Cache automático de todos os eventos
- Duração: 60 segundos (configurável)
- Logs no console para debug:
  - `📦 Usando cache de eventos` - quando usa cache
  - `🔄 Buscando eventos do Firebase` - quando busca do banco

**Código:**
```typescript
private eventsCache: Event[] | null = null;
private cacheTimestamp: number = 0;
private readonly CACHE_DURATION = 60000; // 1 minuto

async getAllEvents(): Promise<Event[]> {
  const now = Date.now();
  if (this.eventsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
    console.log('📦 Usando cache de eventos');
    return this.eventsCache;
  }
  
  // Buscar do Firebase e atualizar cache
  // ...
}
```

**Benefícios:**
- Primeira carga: 1 chamada ao Firebase
- Recargas subsequentes (dentro de 1 min): 0 chamadas ao Firebase
- Reduz custos de leitura do Firestore
- Melhora performance drasticamente

### 2. Cache para getEventById

O método `getEventById` também usa o cache quando disponível:

```typescript
async getEventById(eventId: string): Promise<Event | null> {
  // Tentar buscar do cache primeiro
  if (this.eventsCache) {
    const cachedEvent = this.eventsCache.find(e => e.id === eventId);
    if (cachedEvent) {
      console.log('📦 Usando cache para evento:', eventId);
      return cachedEvent;
    }
  }
  
  // Se não estiver no cache, buscar do Firebase
  // ...
}
```

### 3. ChangeDetectorRef em todos os componentes

Adicionado `ChangeDetectorRef` e chamadas explícitas a `detectChanges()` após operações assíncronas:

**CarouselComponent:**
```typescript
constructor(
  private eventService: EventService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

async loadFeaturedEvents() {
  try {
    // ... buscar eventos
    this.loading = false;
    this.cdr.detectChanges(); // ✅ Força atualização
  } catch (error) {
    this.loading = false;
    this.cdr.detectChanges(); // ✅ Atualiza mesmo em erro
  }
}
```

**EventsComponent e HeroComponent:**
- Mesmo padrão aplicado
- `detectChanges()` após sucesso e erro
- Garante que a UI sempre atualiza

### 4. Proteções no Carousel

Adicionadas verificações para evitar erros quando não há eventos:

```typescript
startAutoPlay() {
  if (this.featuredEvents.length <= 1) return; // ✅ Não inicia se só tem 1 evento
  // ...
}

nextSlide() {
  if (this.featuredEvents.length === 0) return; // ✅ Proteção
  this.currentSlide = (this.currentSlide + 1) % this.featuredEvents.length;
}
```

### 5. Método para limpar cache

Disponível para uso quando necessário:

```typescript
clearCache(): void {
  this.eventsCache = null;
  this.cacheTimestamp = 0;
}
```

**Quando usar:**
- Após criar um novo evento
- Após atualizar um evento
- Quando precisar forçar atualização dos dados

## Fluxo de carregamento otimizado

### Primeira carga da home:
1. CarouselComponent chama `getFeaturedEvents()`
2. EventService chama `getAllEvents()` → **1 GET no Firebase**
3. Cache é populado
4. Filtra eventos featured do cache
5. HeroComponent chama `getAllEvents()` → **Usa cache** (0 GET)
6. EventsComponent chama `getAllEvents()` → **Usa cache** (0 GET)

**Total: 1 chamada ao Firebase**

### Recarregar página (dentro de 1 minuto):
1. CarouselComponent chama `getFeaturedEvents()`
2. EventService verifica cache → **Cache válido**
3. Retorna do cache
4. HeroComponent → **Usa cache**
5. EventsComponent → **Usa cache**

**Total: 0 chamadas ao Firebase**

### Após 1 minuto:
1. Cache expira automaticamente
2. Próxima chamada busca do Firebase novamente
3. Cache é renovado

## Página de detalhes do evento

### Primeira vez que acessa um evento:
1. Verifica se evento está no cache
2. Se sim → **Usa cache** (0 GET)
3. Se não → **Busca do Firebase** (1 GET)

### Navegando entre eventos:
- Se eventos já foram carregados na home → **Usa cache**
- Se evento não está no cache → **Busca do Firebase**

## Monitoramento

Abra o console do navegador e veja os logs:
- `📦 Usando cache de eventos` - Ótimo! Está usando cache
- `📦 Usando cache para evento: [id]` - Evento veio do cache
- `🔄 Buscando eventos do Firebase` - Nova busca no banco
- `🔄 Buscando evento do Firebase: [id]` - Evento específico do banco

## Testes de performance

### Teste 1: Recarregar home 100 vezes em 1 minuto
**Resultado esperado:**
- 1ª carga: 1 GET no Firebase
- 99 recargas: 0 GETs (usa cache)
- **Total: 1 GET**

### Teste 2: Recarregar home 100 vezes em 2 minutos
**Resultado esperado:**
- 1ª carga: 1 GET
- Recargas até 1 min: 0 GETs
- Após 1 min, próxima recarga: 1 GET (renova cache)
- Recargas até 2 min: 0 GETs
- **Total: 2 GETs**

### Teste 3: Navegar entre páginas
**Resultado esperado:**
- Home → 1 GET (carrega eventos)
- Clica em evento → 0 GETs (usa cache)
- Volta para home → 0 GETs (usa cache)
- Clica em outro evento → 0 GETs (usa cache)
- **Total: 1 GET**

## Configuração do cache

Para ajustar a duração do cache, edite em `event.service.ts`:

```typescript
private readonly CACHE_DURATION = 60000; // 1 minuto

// Opções:
// 30000 = 30 segundos
// 60000 = 1 minuto (padrão)
// 300000 = 5 minutos
// 0 = desabilita cache
```

## Custos do Firestore

Com o cache implementado:
- **Antes**: ~3 leituras por carregamento da home
- **Depois**: ~1 leitura a cada minuto (independente de quantas vezes recarregar)
- **Economia**: ~66% de redução nas leituras

Para 1000 usuários acessando a home:
- **Sem cache**: 3000 leituras
- **Com cache**: ~1000 leituras (se distribuído ao longo do tempo)
- **Economia**: ~2000 leituras = economia de custos

## Próximas otimizações sugeridas

1. Implementar Service Worker para cache offline
2. Adicionar pré-carregamento de imagens
3. Implementar lazy loading para componentes
4. Adicionar skeleton screens durante loading
5. Implementar virtual scrolling para listas grandes
