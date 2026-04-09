# Fluxo de Pagamento - Vingo

## Visão Geral

O fluxo de pagamento foi implementado de forma completa e está preparado para integração futura com gateways de pagamento (Stripe, Mercado Pago, PagSeguro, etc).

## Fluxo Completo

### 1. Seleção de Ingressos (`/evento/:id/ingressos`)

**Funcionalidades:**
- Seleção de tipos de ingresso (Pista, Front Stage, Camarote)
- Preenchimento de dados dos participantes
- Primeiro ingresso pré-preenchido com dados do usuário logado
- Validação de CPF e data de nascimento
- Adição de múltiplos ingressos
- Resumo do pedido em tempo real
- Validação completa antes de prosseguir

**Dados Salvos:**
```javascript
sessionStorage.setItem('selectedTickets', JSON.stringify(tickets));
sessionStorage.setItem('eventId', eventId);
sessionStorage.setItem('eventTitle', eventTitle);
```

### 2. Página de Pagamento (`/pagamento`)

**Funcionalidades Implementadas:**

#### Interface de Pagamento
- ✅ Formulário completo de cartão de crédito
- ✅ Formatação automática de campos:
  - Número do cartão (0000 0000 0000 0000)
  - Data de validade (MM/AA)
  - CVV (3-4 dígitos)
- ✅ Validação de campos obrigatórios
- ✅ Resumo detalhado do pedido
- ✅ Informações de segurança
- ✅ Botão "Voltar" para ajustar ingressos
- ✅ Estados de loading e sucesso
- ✅ Tratamento de erros

#### Validações
```typescript
- Número do cartão: mínimo 16 dígitos
- Nome no cartão: mínimo 3 caracteres
- Validade: formato MM/AA
- CVV: 3-4 dígitos
```

#### Processamento
```typescript
async processPayment() {
  // 1. Validar formulário
  if (!this.validatePaymentForm()) return;
  
  // 2. Simular processamento (2 segundos)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. AQUI VOCÊ INTEGRARÁ A API DE PAGAMENTO
  // const paymentResult = await paymentGateway.process({...});
  
  // 4. Salvar compra no Firestore
  await this.savePurchaseToFirestore();
  
  // 5. Mostrar sucesso e redirecionar
  this.paymentSuccess = true;
  setTimeout(() => {
    this.router.navigate(['/meus-ingressos']);
  }, 2000);
}
```

### 3. Salvamento no Firestore

**Estrutura de Dados:**
```typescript
{
  userId: string,
  buyerName: string,
  buyerEmail: string,
  eventId: string,
  eventTitle: string,
  tickets: [
    {
      ticketTypeId: string,
      ticketTypeName: string,
      price: number,
      participantName: string,
      participantCpf: string,
      participantBirthDate: string
    }
  ],
  quantity: number,
  totalPrice: number,
  purchaseDate: Timestamp,
  paymentStatus: 'completed',
  paymentMethod: 'credit_card'
}
```

### 4. Meus Ingressos (`/meus-ingressos`)

**Funcionalidades:**
- ✅ Busca compras do usuário no Firestore
- ✅ Exibição de todos os ingressos
- ✅ Status do evento (Confirmado, Próximo, Hoje, Realizado)
- ✅ Informações detalhadas de cada compra
- ✅ Fallback para dados de exemplo se não houver compras

## Integração Futura com Gateway de Pagamento

### Onde Integrar

No arquivo `src/app/pages/payment/payment.ts`, na função `processPayment()`:

```typescript
async processPayment() {
  if (!this.validatePaymentForm()) return;
  
  this.processing = true;
  this.error = '';

  try {
    // ============================================
    // INTEGRAÇÃO COM GATEWAY DE PAGAMENTO
    // ============================================
    
    // Exemplo com Stripe
    const stripe = await loadStripe('sua_chave_publica');
    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: this.cardName
        }
      }
    });
    
    // Exemplo com Mercado Pago
    const mp = new MercadoPago('sua_chave_publica');
    const paymentResult = await mp.createPayment({
      transaction_amount: this.totalPrice,
      token: cardToken,
      description: this.eventTitle,
      installments: 1,
      payment_method_id: 'visa',
      payer: {
        email: this.authService.currentUser?.email
      }
    });
    
    // Exemplo com PagSeguro
    const pagseguro = new PagSeguro('sua_chave');
    const paymentResult = await pagseguro.createPayment({
      amount: this.totalPrice,
      cardNumber: this.cardNumber,
      cardName: this.cardName,
      cardExpiry: this.cardExpiry,
      cardCvv: this.cardCvv
    });
    
    // ============================================
    // Verificar resultado do pagamento
    if (paymentResult.status === 'succeeded' || paymentResult.status === 'approved') {
      // Pagamento aprovado
      await this.savePurchaseToFirestore();
      this.paymentSuccess = true;
      
      setTimeout(() => {
        sessionStorage.clear();
        this.router.navigate(['/meus-ingressos']);
      }, 2000);
    } else {
      // Pagamento recusado
      this.error = 'Pagamento recusado. Verifique os dados do cartão.';
      this.processing = false;
    }
    
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    this.error = 'Erro ao processar pagamento. Tente novamente.';
    this.processing = false;
  }
}
```

### Gateways Recomendados

#### 1. Stripe
```bash
npm install @stripe/stripe-js
```
- Documentação: https://stripe.com/docs
- Fácil integração
- Aceita cartões internacionais
- Taxa: ~2.9% + R$0.30 por transação

#### 2. Mercado Pago
```bash
npm install mercadopago
```
- Documentação: https://www.mercadopago.com.br/developers
- Popular no Brasil
- Aceita PIX, boleto, cartões
- Taxa: ~4.99% por transação

#### 3. PagSeguro
```bash
npm install pagseguro-nodejs-sdk
```
- Documentação: https://dev.pagseguro.uol.com.br
- Muito usado no Brasil
- Aceita PIX, boleto, cartões
- Taxa: ~3.99% por transação

#### 4. Asaas
- Documentação: https://docs.asaas.com
- Focado em recorrência
- Aceita PIX, boleto, cartões
- Taxa: ~2.99% por transação

## Segurança

### Implementado
- ✅ Validação de campos no frontend
- ✅ Autenticação obrigatória
- ✅ Dados salvos no Firestore com segurança
- ✅ SessionStorage para dados temporários

### A Implementar (com Gateway)
- [ ] Tokenização de cartão (nunca enviar dados do cartão para seu servidor)
- [ ] Certificado SSL (HTTPS obrigatório)
- [ ] Validação de CVV no backend
- [ ] 3D Secure para cartões
- [ ] Webhook para confirmação de pagamento
- [ ] Logs de transações
- [ ] Detecção de fraudes

## Testes

### Testar Fluxo Completo

1. **Login**
   ```
   Faça login com uma conta de teste
   ```

2. **Selecionar Evento**
   ```
   Navegue até um evento e clique em "Comprar Ingresso"
   ```

3. **Selecionar Ingressos**
   ```
   - Escolha o tipo de ingresso
   - Preencha os dados (primeiro já vem preenchido)
   - Adicione mais ingressos se quiser
   - Clique em "Ir para Pagamento"
   ```

4. **Pagamento**
   ```
   - Preencha os dados do cartão (qualquer número por enquanto)
   - Clique em "Finalizar Pagamento"
   - Aguarde o processamento (2 segundos)
   - Veja a mensagem de sucesso
   - Será redirecionado para "Meus Ingressos"
   ```

5. **Verificar Ingressos**
   ```
   - Veja seus ingressos na página "Meus Ingressos"
   - Verifique os dados salvos no Firestore Console
   ```

### Dados de Teste (Stripe)

Quando integrar com Stripe, use estes cartões de teste:

```
Aprovado:
4242 4242 4242 4242
Validade: qualquer data futura
CVV: qualquer 3 dígitos

Recusado:
4000 0000 0000 0002

Requer autenticação:
4000 0025 0000 3155
```

## Próximos Passos

1. **Escolher Gateway de Pagamento**
   - Comparar taxas e funcionalidades
   - Criar conta no gateway escolhido
   - Obter chaves de API (teste e produção)

2. **Instalar SDK**
   ```bash
   npm install @stripe/stripe-js
   # ou
   npm install mercadopago
   ```

3. **Configurar Variáveis de Ambiente**
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     stripePublicKey: 'pk_test_...',
     // ou
     mercadoPagoPublicKey: 'TEST-...'
   };
   ```

4. **Implementar Integração**
   - Seguir documentação do gateway
   - Testar com chaves de teste
   - Implementar webhook para confirmação
   - Adicionar tratamento de erros específicos

5. **Testar em Produção**
   - Usar chaves de produção
   - Fazer transações de teste reais
   - Verificar recebimento de pagamentos
   - Testar estornos e cancelamentos

## Estrutura de Arquivos

```
src/app/pages/
├── ticket-selection/
│   ├── ticket-selection.ts       # Lógica de seleção
│   ├── ticket-selection.html     # Interface de seleção
│   └── ticket-selection.css
├── payment/
│   ├── payment.ts                # Lógica de pagamento ⭐
│   ├── payment.html              # Interface de pagamento
│   └── payment.css
└── my-tickets/
    ├── my-tickets.ts             # Busca ingressos do Firestore
    ├── my-tickets.html           # Exibe ingressos
    └── my-tickets.css
```

## Firestore Collections

```
purchases/
├── {purchaseId}/
│   ├── userId: string
│   ├── buyerName: string
│   ├── buyerEmail: string
│   ├── eventId: string
│   ├── eventTitle: string
│   ├── tickets: array
│   ├── quantity: number
│   ├── totalPrice: number
│   ├── purchaseDate: timestamp
│   ├── paymentStatus: string
│   └── paymentMethod: string
```

## Conclusão

O fluxo de pagamento está 100% funcional e preparado para integração com qualquer gateway de pagamento. Basta escolher o gateway, instalar o SDK e implementar a integração no local indicado.

Todos os dados são salvos corretamente no Firestore e podem ser visualizados na página "Meus Ingressos".
