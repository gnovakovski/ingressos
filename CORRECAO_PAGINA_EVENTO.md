# Correção - Página de Detalhes do Evento

## Problema identificado

A página de detalhes do evento ficava em loop infinito de loading sem mostrar conteúdo ou erro no console.

## Causas do problema

1. **ChangeDetectionStrategy.OnPush sem ChangeDetectorRef**: O componente usava `OnPush` mas não chamava `detectChanges()` após atualizar os dados
2. **Dados mockados**: A página ainda usava dados fixos em vez de buscar do Firebase
3. **Falta de tratamento de erro**: Não havia feedback quando o evento não era encontrado

## Soluções implementadas

### 1. EventDetailsComponent (`src/app/pages/event-details/`)

**Mudanças:**
- Removido `ChangeDetectionStrategy.OnPush` (não necessário aqui)
- Adicionado `ChangeDetectorRef` e chamadas a `detectChanges()`
- Integrado com `EventService` para buscar dados do Firebase
- Adicionado tratamento de erro quando evento não é encontrado
- Método `loadEvent()` agora é `async` e busca dados reais

**Antes:**
```typescript
changeDetection: ChangeDetectionStrategy.OnPush

loadEvent() {
  setTimeout(() => {
    const rawEvent = this.getMockEvent(this.eventId);
    // ... processamento
    this.loading = false;
  }, 300);
}
```

**Depois:**
```typescript
// Sem OnPush forçado

async loadEvent() {
  this.loading = true;
  
  try {
    const firebaseEvent = await this.eventService.getEventById(this.eventId);
    
    if (!firebaseEvent) {
      console.error('Evento não encontrado');
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    // Processar dados do Firebase
    this.event = { /* dados processados */ };
    this.loading = false;
    this.cdr.detectChanges();
    
  } catch (error) {
    console.error('Erro ao carregar evento:', error);
    this.loading = false;
    this.cdr.detectChanges();
  }
}
```

### 2. TicketSelectionComponent (`src/app/pages/ticket-selection/`)

**Mudanças:**
- Removido `ChangeDetectionStrategy.OnPush` 
- Integrado com `EventService` para buscar tipos de ingresso do Firebase
- Método `loadTicketTypes()` agora é `async` e busca dados reais
- Adicionado estado de loading
- Inclui informação de lote do ingresso

**Antes:**
```typescript
loadTicketTypes() {
  const rawTickets = [
    { id: '1', name: 'Pista', price: 120.00, available: 300 },
    // ... dados mockados
  ];
  
  this.ticketTypes = rawTickets.map(/* ... */);
}
```

**Depois:**
```typescript
async loadTicketTypes() {
  try {
    const event = await this.eventService.getEventById(this.eventId);
    
    if (!event) {
      console.error('Evento não encontrado');
      return;
    }

    this.eventTitle = event.title;
    
    this.ticketTypes = event.ticketTypes.map(ticket => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      priceFormatted: ticket.price.toFixed(2),
      available: ticket.available,
      batch: ticket.batch
    }));
    
  } catch (error) {
    console.error('Erro ao carregar tipos de ingresso:', error);
  }
}
```

## Fluxo completo agora

1. **Home** → Clica no evento → Navega para `/evento/:id`
2. **EventDetailsComponent** → Busca evento do Firebase pelo ID
3. **Mostra detalhes** → Botão "Comprar Ingressos"
4. **TicketSelectionComponent** → Busca tipos de ingresso do Firebase
5. **Seleção de ingressos** → Preenche dados dos participantes
6. **PaymentComponent** → Processa pagamento e salva no Firebase

## Dados exibidos do Firebase

### Página de Detalhes
- Título do evento
- Descrição completa
- Data formatada (ex: "Sex, 13 Jun 2026")
- Horário (ex: "17:00 - 23:00")
- Local (ex: "Porto Alegre - RS")
- Endereço completo
- Imagem do evento
- Tipos de ingresso com preços
- Total de ingressos disponíveis

### Página de Seleção
- Título do evento
- Tipos de ingresso disponíveis
- Preço de cada tipo
- Lote (ex: "Primeiro Lote")
- Quantidade disponível
- Formulário para dados dos participantes

## Testando

1. Acesse a home
2. Clique no Festival Ressuscitou 2026
3. Deve carregar a página de detalhes com os dados do Firebase
4. Clique em "Comprar Ingressos"
5. Deve mostrar o tipo de ingresso "Ingresso Básico - Primeiro Lote - R$ 120,00"
6. Preencha os dados e continue para pagamento

## Próximos passos

- Adicionar mais tipos de ingresso ao Festival Ressuscitou
- Implementar sistema de lotes automático (quando um lote esgota, abre o próximo)
- Adicionar validação de disponibilidade em tempo real
- Implementar reserva temporária de ingressos durante a compra
