# Sistema de Vouchers - Documentação Completa

## ✅ O que foi implementado

### 1. VoucherService

Serviço completo para gerenciamento de vouchers com:
- Geração de código único (formato: XX999999XX)
- Geração de QR Code
- Geração de código de barras (CODE128)
- Criação de vouchers no Firebase
- Busca de vouchers por usuário
- Busca de vouchers por evento

### 2. Estrutura do Voucher

```typescript
interface Voucher {
  id: string;                    // ID do documento no Firestore
  code: string;                  // Código único (mesmo para QR e barcode)
  userId: string;                // ID do usuário comprador
  eventId: string;               // ID do evento
  eventTitle: string;            // Nome do evento
  eventDate: Date;               // Data do evento
  eventLocation: string;         // Local (cidade - estado)
  eventAddress: string;          // Endereço completo
  ticketType: string;            // Tipo de ingresso
  ticketBatch: string;           // Lote do ingresso
  price: number;                 // Valor pago
  participantName: string;       // Nome do participante
  participantCpf: string;        // CPF do participante
  participantBirthDate: string;  // Data de nascimento
  purchaseDate: Date;            // Data da compra
  status: 'active' | 'used' | 'cancelled';
  qrCodeDataUrl?: string;        // QR Code em base64
  barcodeDataUrl?: string;       // Código de barras em base64
}
```

### 3. Fluxo de Compra Atualizado

1. **Seleção de ingressos** → Usuário escolhe tipos e preenche dados
2. **Pagamento** → Processa pagamento (simulado)
3. **Geração de vouchers** → Cria um voucher para cada ingresso
4. **Salvamento no Firebase** → Armazena na collection 'vouchers'
5. **Redirecionamento** → Vai para "Meus Ingressos"

### 4. Página "Meus Ingressos" Atualizada

**Funcionalidades:**
- Lista todos os vouchers do usuário
- Agrupa vouchers por evento
- Mostra resumo: total de ingressos, eventos e valor gasto
- Status do evento (Confirmado, Próximo, Em X dias, Hoje, Realizado)
- Botão de download individual para cada voucher

**Layout:**
- Cards agrupados por evento
- Informações de cada participante
- Código único visível
- Botão de download destacado

### 5. Geração de PDF do Voucher

**Layout do PDF (A4 Paisagem):**

```
┌─────────────────────────────────────────────────────────────┐
│ [Fundo Azul Claro]                                          │
│                                                             │
│ Festival Ressuscitou 2026                                   │
│ 📅 13/06/2026 17:00                                        │
│ 📍 Porto Alegre - RS                                       │
│    Parque Harmonia                                         │
│                                                             │
│ ┌─────────────────────────────┐  ┌──────────────────┐     │
│ │ Ingresso                     │  │                  │     │
│ │ Primeiro Lote - Básico       │  │    [QR CODE]     │     │
│ │ R$ 120,00                    │  │                  │     │
│ │ Comprado dia 09/04/2026      │  │   ULJ1H1AL7      │     │
│ └─────────────────────────────┘  └──────────────────┘     │
│                                                             │
│ ┌─────────────────────────────┐                            │
│ │ Participante                 │                            │
│ │ João Silva                   │                            │
│ └─────────────────────────────┘                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │        [CÓDIGO DE BARRAS - ULJ1H1AL7]               │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- Fundo azul claro (#ADD8E6)
- Título do evento em destaque
- Data, hora e local
- Box do ingresso com tipo, lote e valor
- Box do participante com nome
- QR Code grande e legível
- Código alfanumérico abaixo do QR
- Código de barras na parte inferior
- **QR Code e Barcode têm o MESMO valor** para validação

### 6. Código Único

**Formato:** `XX999999XX`
- 2 letras maiúsculas
- 6 números
- 2 letras maiúsculas
- Exemplo: `ULJ1H1AL7`, `AB123456CD`

**Características:**
- Único para cada voucher
- Usado tanto no QR Code quanto no código de barras
- Fácil de digitar manualmente se necessário
- Permite validação cruzada

### 7. Validação do Voucher

**Como validar:**
1. Ler QR Code → Obtém código
2. OU ler código de barras → Obtém código
3. OU digitar código manualmente
4. Buscar no Firebase: `vouchers` where `code == [código]`
5. Verificar status: `active`, `used`, `cancelled`
6. Marcar como `used` após entrada

## 🔧 Bibliotecas Utilizadas

```json
{
  "qrcode": "^1.5.x",      // Geração de QR Code
  "jsbarcode": "^3.11.x",  // Geração de código de barras
  "jspdf": "^2.5.x",       // Geração de PDF
  "html2canvas": "^1.4.x"  // Conversão HTML para imagem
}
```

## 📊 Collection no Firebase

### vouchers
```javascript
{
  code: "ULJ1H1AL7",
  userId: "abc123",
  eventId: "nWM5SRdxsATNdtyDxbLj",
  eventTitle: "Festival Ressuscitou 2026",
  eventDate: Timestamp,
  eventLocation: "Porto Alegre - RS",
  eventAddress: "Parque Harmonia - Porto Alegre",
  ticketType: "Ingresso Básico",
  ticketBatch: "Primeiro Lote",
  price: 120.00,
  participantName: "João Silva",
  participantCpf: "123.456.789-00",
  participantBirthDate: "1990-01-01",
  purchaseDate: Timestamp,
  status: "active"
}
```

## 🎯 Fluxo Completo

### Compra
1. Usuário seleciona evento
2. Escolhe tipos de ingresso
3. Preenche dados dos participantes
4. Vai para pagamento
5. Processa pagamento
6. **Sistema gera vouchers automaticamente**
7. Salva no Firebase
8. Redireciona para "Meus Ingressos"

### Visualização
1. Usuário acessa "Meus Ingressos"
2. Sistema busca vouchers do usuário
3. Agrupa por evento
4. Exibe lista com botões de download

### Download
1. Usuário clica em "Baixar"
2. Sistema gera PDF com:
   - Informações do evento
   - Dados do ingresso
   - Dados do participante
   - QR Code
   - Código de barras
3. PDF é baixado automaticamente

### Validação (Futuro)
1. Scanner lê QR Code ou código de barras
2. Obtém código único
3. Busca no Firebase
4. Verifica status
5. Se `active` → Marca como `used` e permite entrada
6. Se `used` → Bloqueia (já foi usado)
7. Se `cancelled` → Bloqueia (cancelado)

## 🚀 Como usar

### Criar vouchers manualmente (para testes)
```typescript
const voucherService = inject(VoucherService);

await voucherService.createVouchers(
  'userId123',
  'eventId456',
  'Festival Ressuscitou 2026',
  new Date('2026-06-13'),
  'Porto Alegre - RS',
  'Parque Harmonia',
  [
    {
      ticketType: 'Ingresso Básico',
      ticketBatch: 'Primeiro Lote',
      price: 120.00,
      participantName: 'João Silva',
      participantCpf: '123.456.789-00',
      participantBirthDate: '1990-01-01'
    }
  ]
);
```

### Buscar vouchers de um usuário
```typescript
const vouchers = await voucherService.getUserVouchers('userId123');
```

### Baixar voucher
```typescript
await downloadVoucher(voucher);
```

## 📝 Próximos passos sugeridos

1. **Sistema de validação**
   - App mobile para scanner
   - Validação em tempo real
   - Histórico de validações

2. **Melhorias no voucher**
   - Adicionar logo do evento
   - Personalizar cores por evento
   - Adicionar termos e condições

3. **Notificações**
   - Email com voucher anexado
   - Lembrete antes do evento
   - Confirmação de entrada

4. **Segurança**
   - Criptografia do código
   - Marca d'água no PDF
   - Limite de downloads

5. **Analytics**
   - Taxa de comparecimento
   - Horário de entrada
   - Relatórios por evento

## ✅ Resultado

Sistema completo de vouchers com:
- ✅ Geração automática após pagamento
- ✅ QR Code e código de barras com mesmo valor
- ✅ PDF profissional para download
- ✅ Armazenamento no Firebase
- ✅ Listagem agrupada por evento
- ✅ Status do evento
- ✅ Um voucher por participante
- ✅ Pronto para validação futura

Cada participante tem seu próprio voucher individual com seus dados! 🎉
