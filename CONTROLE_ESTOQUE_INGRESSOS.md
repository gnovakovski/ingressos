# Sistema de Controle de Estoque de Ingressos

## 🎯 Objetivo

Decrementar automaticamente a quantidade disponível de ingressos quando vouchers são gerados, garantindo que não haja venda além da capacidade.

## ✅ Implementação

### 1. Transação Atômica

Usamos `runTransaction` do Firestore para garantir que a verificação de disponibilidade e a criação de vouchers aconteçam atomicamente:

```typescript
await runTransaction(db, async (transaction) => {
  // 1. Verificar disponibilidade
  // 2. Atualizar estoque
  // 3. Criar vouchers
});
```

### 2. Fluxo Completo

```
Usuário seleciona ingressos
         ↓
Clica em "Ir para Pagamento"
         ↓
Sistema conta quantos de cada tipo
         ↓
Inicia transação Firestore
         ↓
Verifica disponibilidade
         ↓
Há ingressos suficientes?
    ↓ Sim          ↓ Não
Decrementa      Erro: "Ingressos
estoque         insuficientes"
    ↓
Cria vouchers
    ↓
Commit da transação
    ↓
Sucesso!
```

### 3. Verificação de Disponibilidade

```typescript
// Contar quantos ingressos de cada tipo
const ticketCounts = new Map<string, number>();
tickets.forEach(ticket => {
  const count = ticketCounts.get(ticket.ticketTypeId) || 0;
  ticketCounts.set(ticket.ticketTypeId, count + 1);
});

// Verificar se há ingressos disponíveis
for (const [ticketTypeId, quantity] of ticketCounts.entries()) {
  const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
  
  if (ticketType.available < quantity) {
    throw new Error(`Ingressos insuficientes`);
  }
}
```

### 4. Atualização do Estoque

```typescript
// Atualizar quantidade disponível de cada tipo
const updatedTicketTypes = ticketTypes.map((ticketType) => {
  const quantity = ticketCounts.get(ticketType.id) || 0;
  if (quantity > 0) {
    return {
      ...ticketType,
      available: ticketType.available - quantity
    };
  }
  return ticketType;
});

transaction.update(eventRef, { ticketTypes: updatedTicketTypes });
```

### 5. Criação de Vouchers

```typescript
// Criar vouchers dentro da transação
for (const ticket of tickets) {
  const voucherRef = doc(collection(db, 'vouchers'));
  transaction.set(voucherRef, voucherData);
}
```

## 📊 Exemplo Prático

### Antes da Compra

```json
{
  "ticketTypes": [
    {
      "id": "basic-001",
      "name": "Ingresso Básico",
      "available": 100,
      "price": 120
    },
    {
      "id": "vip-001",
      "name": "Ingresso VIP",
      "available": 50,
      "price": 250
    }
  ]
}
```

### Usuário Compra

- 2x Ingresso Básico
- 1x Ingresso VIP
- 1x Ingresso Básico (acompanhante)

**Total:** 3 Básicos + 1 VIP

### Depois da Compra

```json
{
  "ticketTypes": [
    {
      "id": "basic-001",
      "name": "Ingresso Básico",
      "available": 97,  // 100 - 3
      "price": 120
    },
    {
      "id": "vip-001",
      "name": "Ingresso VIP",
      "available": 49,  // 50 - 1
      "price": 250
    }
  ]
}
```

## 🔒 Segurança e Confiabilidade

### Transação Atômica
- ✅ Tudo ou nada: se falhar, nada é salvo
- ✅ Sem race conditions
- ✅ Sem overselling (vender mais que o disponível)

### Verificação Dupla
1. Verifica disponibilidade ANTES de decrementar
2. Firestore garante atomicidade da transação

### Tratamento de Erros
```typescript
if (ticketType.available < quantity) {
  throw new Error(
    `Ingressos insuficientes para ${ticketType.name}. 
     Disponível: ${ticketType.available}, 
     Solicitado: ${quantity}`
  );
}
```

## 📝 Logs Detalhados

### Sucesso
```
🎫 Criando vouchers e atualizando estoque...
   - Total de ingressos: 4
   - Tipos de ingresso: basic-001: 3, vip-001: 1
   ✅ Ingresso Básico: 100 disponíveis, reservando 3
   ✅ Ingresso VIP: 50 disponíveis, reservando 1
   📉 Decrementando Ingresso Básico: 100 → 97
   📉 Decrementando Ingresso VIP: 50 → 49
✅ Vouchers criados e estoque atualizado com sucesso
```

### Erro (Ingressos Insuficientes)
```
🎫 Criando vouchers e atualizando estoque...
   - Total de ingressos: 60
   - Tipos de ingresso: vip-001: 60
❌ Erro ao criar vouchers: Ingressos insuficientes para Ingresso VIP. 
   Disponível: 50, Solicitado: 60
```

## 🎯 Benefícios

✅ **Controle preciso** - Nunca vende mais que o disponível
✅ **Atômico** - Tudo ou nada, sem estados inconsistentes
✅ **Seguro** - Protegido contra race conditions
✅ **Transparente** - Logs detalhados de cada operação
✅ **Escalável** - Funciona com múltiplos usuários simultâneos
✅ **Confiável** - Firestore garante consistência

## 🧪 Como Testar

1. **Verificar estoque inicial** no Firebase Console
2. **Comprar ingressos** (incluindo acompanhantes)
3. **Verificar logs** no console do navegador
4. **Confirmar decremento** no Firebase Console
5. **Tentar comprar mais que o disponível** - deve dar erro

## 📚 Estrutura de Dados

### Ticket no Frontend
```typescript
{
  ticketType: string;        // Nome do tipo
  ticketBatch: string;       // Lote
  price: number;             // Preço
  participantName: string;   // Nome do participante
  participantCpf: string;    // CPF
  participantBirthDate: string; // Data de nascimento
  ticketTypeId: string;      // ID para decrementar estoque ⭐
}
```

### Event no Firestore
```typescript
{
  ticketTypes: [
    {
      id: string;           // ID único
      name: string;         // Nome
      available: number;    // Quantidade disponível ⭐
      price: number;        // Preço
      batch: string;        // Lote
    }
  ]
}
```

## 🎉 Resultado

O sistema agora controla automaticamente o estoque de ingressos, garantindo que:
- Cada compra decrementa a quantidade disponível
- Não é possível vender mais ingressos do que o disponível
- Acompanhantes são contabilizados corretamente
- Tudo acontece de forma atômica e segura
