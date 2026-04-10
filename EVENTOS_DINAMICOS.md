# Eventos Dinâmicos com Firebase

## O que foi implementado

Transformei a aplicação para buscar eventos dinamicamente do Firebase Firestore, substituindo os dados mockados.

## Estrutura criada

### 1. EventService (`src/app/services/event.service.ts`)
Serviço responsável por gerenciar eventos no Firebase:
- `createEvent()` - Criar novos eventos
- `getAllEvents()` - Buscar todos os eventos
- `getEventById()` - Buscar evento específico por ID
- `getFeaturedEvents()` - Buscar eventos em destaque
- `getEventsByCategory()` - Buscar eventos por categoria

### 2. Interface de Evento
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  date: Date;
  endDate?: Date;
  location: string;
  venue: string;
  city: string;
  state: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketType[];
  featured: boolean;
  createdAt: Date;
}
```

### 3. Interface de Tipo de Ingresso
```typescript
interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  batch: string; // "Primeiro Lote", "Segundo Lote", etc
  batchNumber: number;
}
```

## Evento criado: Festival Ressuscitou 2026

### Dados do evento
- **Nome**: Festival Ressuscitou 2026
- **Categoria**: Festival
- **Data**: 13 e 14 de Junho de 2026
- **Horário**: 17:00 às 23:00
- **Local**: Parque Harmonia - Porto Alegre/RS
- **Descrição**: Um convite para viver a fé de forma profunda, alegre e inesquecível
- **Featured**: Sim (aparece no banner)

### Tipo de ingresso
- **Nome**: Ingresso Básico
- **Preço**: R$ 120,00
- **Lote**: Primeiro Lote
- **Disponível**: 500 ingressos
- **Descrição**: Acesso completo aos dois dias do festival

## Componentes atualizados

### 1. EventsComponent (`src/app/components/events/`)
- Busca eventos do Firebase ao iniciar
- Exibe loading enquanto carrega
- Formata datas e preços automaticamente
- Mapeia categorias para gradientes e ícones

### 2. CarouselComponent (`src/app/components/carousel/`)
- Busca eventos em destaque (featured: true)
- Exibe no banner principal
- Navegação clicável para página do evento
- Loading state

## Como adicionar novos eventos

### Opção 1: Via script
```bash
npm run add-event
```

### Opção 2: Programaticamente
```typescript
const eventService = inject(EventService);

await eventService.createEvent({
  title: 'Nome do Evento',
  shortDescription: 'Descrição curta',
  description: 'Descrição completa...',
  category: 'Festival',
  image: 'https://url-da-imagem.jpg',
  date: new Date('2026-06-13'),
  endDate: new Date('2026-06-14'),
  location: 'Local Completo',
  venue: 'Nome do Venue',
  city: 'Cidade',
  state: 'UF',
  startTime: '17:00',
  endTime: '23:00',
  featured: true,
  ticketTypes: [
    {
      id: 'tipo-1',
      name: 'Ingresso VIP',
      price: 200.00,
      description: 'Acesso VIP',
      available: 100,
      batch: 'Primeiro Lote',
      batchNumber: 1
    }
  ]
});
```

## Categorias disponíveis
- Festival
- Show
- Festa
- Entretenimento
- Tecnologia
- Música

Cada categoria tem um gradiente e ícone específico definido no componente.

## Próximos passos sugeridos

1. Atualizar página de detalhes do evento para buscar do Firebase
2. Implementar filtros por categoria
3. Adicionar busca de eventos
4. Criar painel admin para gerenciar eventos
5. Implementar paginação para muitos eventos
