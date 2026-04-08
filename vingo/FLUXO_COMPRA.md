# Fluxo de Compra de Ingressos

## 🎯 Visão Geral

Sistema completo de compra de ingressos com 3 etapas:
1. **Detalhes do Evento** - Visualizar informações completas
2. **Seleção de Ingressos** - Escolher tipos e adicionar participantes
3. **Pagamento** - Finalizar compra (gateway a ser integrado)

## 📍 Rotas Criadas

```
/evento/:id                  → Detalhes do Evento
/evento/:id/ingressos        → Seleção de Ingressos
/pagamento                   → Página de Pagamento
```

## 🎫 Fluxo Completo

### 1. Detalhes do Evento (`/evento/:id`)

**Componente**: `EventDetailsComponent`

**Funcionalidades:**
- Imagem grande do evento
- Título, data, local e horário
- Descrição completa
- Lista de tipos de ingresso com preços
- Endereço completo
- Badge de disponibilidade
- Botão "Selecionar Ingressos"

**Dados Mockados:**
```typescript
{
  id: '1',
  title: 'Festival Eletrônica 2026',
  description: 'Descrição completa...',
  date: new Date('2026-05-15T20:00:00'),
  location: 'São Paulo - SP',
  address: 'Av. Paulista, 1000',
  imageUrl: 'url...',
  ticketTypes: [
    { id: '1', name: 'Pista', price: 120.00, available: 300 },
    { id: '2', name: 'Front Stage', price: 200.00, available: 150 },
    { id: '3', name: 'Camarote', price: 350.00, available: 50 }
  ]
}
```

**Navegação:**
- Clique no card de evento na home → `/evento/1`
- Clique em "Selecionar Ingressos" → `/evento/1/ingressos`

### 2. Seleção de Ingressos (`/evento/:id/ingressos`)

**Componente**: `TicketSelectionComponent`

**Funcionalidades:**
- ✅ Adiciona automaticamente ingresso para o usuário logado
- ✅ Permite adicionar múltiplos participantes
- ✅ Cada participante pode ter tipo de ingresso diferente
- ✅ Campos obrigatórios: Nome, CPF, Data de Nascimento
- ✅ Formatação automática de CPF
- ✅ Validação de todos os campos
- ✅ Resumo em tempo real com cálculo de preços
- ✅ Botão para remover participantes (exceto se for único)

**Estrutura de Dados:**
```typescript
interface TicketPerson {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  name: string;
  cpf: string;
  birthDate: string;
}
```

**Exemplo de Uso:**
```
Participante 1 (Usuário):
- Tipo: Pista (R$ 120,00)
- Nome: João Silva
- CPF: 123.456.789-00
- Data: 01/01/1990

Participante 2 (Namorada):
- Tipo: Front Stage (R$ 200,00)
- Nome: Maria Santos
- CPF: 987.654.321-00
- Data: 15/05/1992

Participante 3 (Filho):
- Tipo: Pista (R$ 120,00)
- Nome: Pedro Silva
- CPF: 111.222.333-44
- Data: 10/10/2010

Total: R$ 440,00
```

**Validações:**
- Nome não pode estar vazio
- CPF deve ter 11 dígitos
- Data de nascimento obrigatória
- Pelo menos 1 ingresso

**Navegação:**
- Clique em "Ir para Pagamento" → `/pagamento`
- Dados salvos no `sessionStorage`

### 3. Pagamento (`/pagamento`)

**Componente**: `PaymentComponent`

**Funcionalidades:**
- Resumo completo do pedido
- Lista de todos os ingressos com nomes
- Total a pagar
- Área para integração do gateway
- Botão de simulação de pagamento

**Dados Carregados:**
- Recupera do `sessionStorage`:
  - `selectedTickets` - Array de ingressos
  - `eventId` - ID do evento
  - `eventTitle` - Título do evento

**Integração Futura:**
```typescript
// Exemplo com Stripe
import { loadStripe } from '@stripe/stripe-js';

async processPayment() {
  const stripe = await loadStripe('pk_...');
  const { error } = await stripe.redirectToCheckout({
    lineItems: this.selectedTickets.map(t => ({
      price: t.priceId,
      quantity: 1
    })),
    mode: 'payment',
    successUrl: `${window.location.origin}/sucesso`,
    cancelUrl: `${window.location.origin}/cancelado`,
  });
}
```

**Simulação Atual:**
- Clique em "Simular Pagamento"
- Loading de 2 segundos
- Limpa `sessionStorage`
- Redireciona para `/meus-ingressos`

## 🎨 Design

**Tema Consistente:**
- Fundo: Gradiente verde escuro (#07532F → #16201E)
- Cards: `bg-gray-800/90` com backdrop blur
- Botões: Verde #10B981
- Textos: Branco e cinza claro
- Bordas: `border-gray-700/50`

**Responsividade:**
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3 colunas (detalhes) / 2 colunas (seleção)

## 🔒 Segurança

**Proteções Implementadas:**
- Requer login para selecionar ingressos
- Validação de todos os campos
- Formatação de CPF
- Dados temporários em `sessionStorage`
- Redirecionamento se dados ausentes

**A Implementar:**
- Validação de CPF real
- Verificação de idade mínima
- Limite de ingressos por pessoa
- Timeout de sessão
- Criptografia de dados sensíveis

## 📊 Tipos de Ingresso

**Estrutura:**
```typescript
interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
}
```

**Exemplos:**
- **Pista**: Área geral, R$ 120,00
- **Front Stage**: Próximo ao palco, R$ 200,00
- **Camarote**: VIP com open bar, R$ 350,00

**Customização:**
- Adicione quantos tipos quiser
- Cada tipo tem preço e disponibilidade próprios
- Descrições personalizadas

## 🚀 Próximos Passos

### Integração Firebase
```typescript
// event-details.ts
async loadEvent() {
  this.event = await this.firebaseService.getEventById(this.eventId);
}

// ticket-selection.ts
async goToPayment() {
  // Salvar no Firestore antes de ir para pagamento
  await this.firebaseService.createPendingOrder({
    eventId: this.eventId,
    tickets: this.selectedTickets,
    userId: this.authService.currentUser.uid,
    status: 'pending'
  });
}
```

### Gateway de Pagamento

**Opções:**
1. **Stripe** - Internacional, fácil integração
2. **Mercado Pago** - Popular no Brasil
3. **PagSeguro** - Brasileiro, confiável
4. **Asaas** - Brasileiro, taxas baixas

**Exemplo Mercado Pago:**
```typescript
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: 'YOUR_ACCESS_TOKEN' 
});

const preference = new Preference(client);

const response = await preference.create({
  items: this.selectedTickets.map(t => ({
    title: `${this.eventTitle} - ${t.ticketTypeName}`,
    quantity: 1,
    unit_price: t.price
  })),
  back_urls: {
    success: `${window.location.origin}/sucesso`,
    failure: `${window.location.origin}/falha`,
    pending: `${window.location.origin}/pendente`
  }
});

// Redirecionar para checkout
window.location.href = response.init_point;
```

### Melhorias Sugeridas

1. **Validação de CPF real**
2. **Verificação de idade mínima**
3. **Limite de ingressos por CPF**
4. **Sistema de cupons de desconto**
5. **Escolha de assentos (para eventos com lugares marcados)**
6. **Envio de email com QR Code**
7. **Página de sucesso personalizada**
8. **Histórico de tentativas de pagamento**
9. **Reembolso automático**
10. **Notificações push**

## 📝 Testando o Fluxo

1. **Acesse a home** (`/`)
2. **Clique em um evento**
3. **Veja os detalhes** e tipos de ingresso
4. **Clique em "Selecionar Ingressos"**
5. **Faça login** (se não estiver logado)
6. **Veja seu nome** já preenchido no primeiro ingresso
7. **Adicione mais participantes** se quiser
8. **Preencha todos os dados** (nome, CPF, data)
9. **Escolha tipos diferentes** de ingresso
10. **Veja o resumo** sendo atualizado
11. **Clique em "Ir para Pagamento"**
12. **Veja o resumo final**
13. **Clique em "Simular Pagamento"**
14. **Aguarde 2 segundos**
15. **Seja redirecionado** para "Meus Ingressos"

## 🎉 Resultado

Sistema completo e funcional de compra de ingressos, pronto para integração com gateway de pagamento real!
