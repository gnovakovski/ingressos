# QR Code e Código de Barras - Como Funciona

## Código Único

Cada voucher tem um código único no formato: `XX999999XX`

**Exemplo:** `AB123456CD`

- 2 letras maiúsculas (A-Z)
- 6 números (0-9)
- 2 letras maiúsculas (A-Z)

## Geração do Código

```typescript
generateUniqueCode(): string {
  const letters1 = String.fromCharCode(
    65 + Math.floor(Math.random() * 26), 
    65 + Math.floor(Math.random() * 26)
  );
  const numbers = Math.floor(100000 + Math.random() * 900000);
  const letters2 = String.fromCharCode(
    65 + Math.floor(Math.random() * 26), 
    65 + Math.floor(Math.random() * 26)
  );
  return `${letters1}${numbers}${letters2}`;
}
```

**Resultado:** Código como `ULJ1H1AL7`, `AB123456CD`, `XY789012ZW`

## QR Code

**Biblioteca:** `qrcode`

**O que contém:** O código único (ex: `AB123456CD`)

**Geração:**
```typescript
async generateQRCode(code: string): Promise<string> {
  return await QRCode.toDataURL(code, {
    width: 200,      // Tamanho 200x200 pixels
    margin: 1,       // Margem mínima
    color: {
      dark: '#000000',   // Preto
      light: '#FFFFFF'   // Branco
    }
  });
}
```

**Resultado:** Data URL (base64) da imagem do QR Code

**Quando escanear:** Vai ler o texto `AB123456CD`

## Código de Barras

**Biblioteca:** `jsbarcode`

**O que contém:** O MESMO código único (ex: `AB123456CD`)

**Formato:** CODE128 (padrão industrial)

**Geração:**
```typescript
generateBarcode(code: string): string {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, code, {
    format: 'CODE128',    // Formato padrão
    width: 2,             // Largura das barras
    height: 60,           // Altura
    displayValue: false,  // Não mostra texto embaixo
    margin: 0             // Sem margem
  });
  return canvas.toDataURL('image/png');
}
```

**Resultado:** Data URL (base64) da imagem do código de barras

**Quando escanear:** Vai ler o texto `AB123456CD`

## Validação Cruzada

Ambos os códigos contêm o MESMO valor, permitindo validação de 3 formas:

### 1. Escanear QR Code
```
Scanner QR → Lê "AB123456CD" → Busca no Firebase
```

### 2. Escanear Código de Barras
```
Scanner Barcode → Lê "AB123456CD" → Busca no Firebase
```

### 3. Digitar Manualmente
```
Usuário digita "AB123456CD" → Busca no Firebase
```

## No PDF

### Layout do QR Code
```
┌──────────────────┐
│                  │
│    [QR CODE]     │  ← 200x200 pixels
│                  │
│   AB123456CD     │  ← Código visível
└──────────────────┘
```

### Layout do Código de Barras
```
┌─────────────────────────────────────────┐
│  |||  ||  |  ||  |||  |  ||  |||  ||   │  ← Barras
└─────────────────────────────────────────┘
```

## Armazenamento no Firebase

```javascript
{
  code: "AB123456CD",           // ← Código único
  userId: "user123",
  eventId: "event456",
  eventTitle: "Festival Ressuscitou 2026",
  participantName: "João Silva",
  status: "active",
  // ... outros campos
}
```

**Nota:** QR Code e Barcode NÃO são salvos no Firebase, são gerados dinamicamente quando necessário.

## Fluxo de Validação

### No momento da entrada no evento:

1. **Scanner lê o código**
   - QR Code → `AB123456CD`
   - OU Barcode → `AB123456CD`
   - OU Manual → `AB123456CD`

2. **Busca no Firebase**
   ```typescript
   const vouchersRef = collection(db, 'vouchers');
   const q = query(vouchersRef, where('code', '==', 'AB123456CD'));
   const snapshot = await getDocs(q);
   ```

3. **Verifica status**
   ```typescript
   if (snapshot.empty) {
     return "Voucher não encontrado";
   }
   
   const voucher = snapshot.docs[0].data();
   
   if (voucher.status === 'used') {
     return "Voucher já foi usado";
   }
   
   if (voucher.status === 'cancelled') {
     return "Voucher cancelado";
   }
   
   if (voucher.status === 'active') {
     // Marcar como usado
     await updateDoc(doc(db, 'vouchers', snapshot.docs[0].id), {
       status: 'used',
       usedAt: Timestamp.now()
     });
     return "Entrada permitida";
   }
   ```

4. **Exibe informações**
   ```
   ✅ Entrada Permitida
   
   Participante: João Silva
   Evento: Festival Ressuscitou 2026
   Tipo: Ingresso Básico
   Lote: Primeiro Lote
   ```

## Segurança

### Características do código:
- ✅ Único para cada voucher
- ✅ Aleatório (não sequencial)
- ✅ Fácil de digitar se necessário
- ✅ Difícil de adivinhar (26² × 10⁶ × 26² = 456.976.000.000 combinações)

### Validação:
- ✅ Verifica existência no banco
- ✅ Verifica status (active/used/cancelled)
- ✅ Marca como usado após entrada
- ✅ Impede uso duplicado

## Exemplo Completo

### Voucher criado:
```javascript
{
  id: "voucher123",
  code: "ULJ1H1AL7",
  participantName: "João Silva",
  status: "active"
}
```

### QR Code gerado:
- Contém: `ULJ1H1AL7`
- Formato: PNG base64
- Tamanho: 200x200px

### Código de Barras gerado:
- Contém: `ULJ1H1AL7`
- Formato: CODE128
- Formato: PNG base64

### No PDF:
```
┌─────────────────────────────────────────┐
│ Festival Ressuscitou 2026               │
│                                         │
│ Ingresso Básico - R$ 120,00             │
│ João Silva                              │
│                                         │
│        [QR CODE]                        │
│       ULJ1H1AL7                         │
│                                         │
│ |||  ||  |  ||  |||  |  ||  |||  ||    │
└─────────────────────────────────────────┘
```

### Ao escanear:
- QR Code → `ULJ1H1AL7`
- Barcode → `ULJ1H1AL7`
- Ambos levam ao mesmo voucher no Firebase

## Testando

1. Gere um voucher
2. Baixe o PDF
3. Use um app de scanner de QR Code no celular
4. Escaneie o QR Code → Vai mostrar o código
5. Use um app de scanner de código de barras
6. Escaneie o código de barras → Vai mostrar o MESMO código

**Apps recomendados para teste:**
- QR Code: Google Lens, QR Code Reader
- Barcode: Barcode Scanner, ShopSavvy

## Implementação Futura

Para criar um sistema de validação:

```typescript
// App de validação
async function validateVoucher(scannedCode: string) {
  const vouchersRef = collection(db, 'vouchers');
  const q = query(vouchersRef, where('code', '==', scannedCode));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return { valid: false, message: 'Voucher não encontrado' };
  }
  
  const voucher = snapshot.docs[0];
  const data = voucher.data();
  
  if (data.status === 'used') {
    return { 
      valid: false, 
      message: 'Voucher já foi usado',
      usedAt: data.usedAt 
    };
  }
  
  if (data.status === 'cancelled') {
    return { valid: false, message: 'Voucher cancelado' };
  }
  
  // Marcar como usado
  await updateDoc(voucher.ref, {
    status: 'used',
    usedAt: Timestamp.now()
  });
  
  return {
    valid: true,
    message: 'Entrada permitida',
    participant: data.participantName,
    event: data.eventTitle,
    ticketType: data.ticketType
  };
}
```

Pronto! Agora você entende completamente como funciona o sistema de códigos! 🎫
