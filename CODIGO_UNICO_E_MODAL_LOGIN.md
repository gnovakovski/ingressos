# Sistema de Código Único e Modal de Login

## 📋 Código Único para Vouchers

### Como Funciona

Cada voucher recebe um código único no formato: `XX999999XX`

**Exemplo:** `PN631076YU`

### Lógica de Geração

```typescript
generateUniqueCode(): string {
  // 1. Gera 2 letras aleatórias (A-Z)
  const letters1 = String.fromCharCode(
    65 + Math.floor(Math.random() * 26),  // Primeira letra (A-Z)
    65 + Math.floor(Math.random() * 26)   // Segunda letra (A-Z)
  );
  
  // 2. Gera 6 números aleatórios (100000-999999)
  const numbers = Math.floor(100000 + Math.random() * 900000);
  
  // 3. Gera mais 2 letras aleatórias (A-Z)
  const letters2 = String.fromCharCode(
    65 + Math.floor(Math.random() * 26),  // Terceira letra (A-Z)
    65 + Math.floor(Math.random() * 26)   // Quarta letra (A-Z)
  );
  
  // 4. Combina tudo
  return `${letters1}${numbers}${letters2}`;
}
```

### Detalhes Técnicos

**String.fromCharCode():**
- Converte código ASCII em caractere
- `65` = 'A', `66` = 'B', ..., `90` = 'Z'
- `Math.random() * 26` gera número de 0 a 25
- `65 + Math.floor(Math.random() * 26)` = código ASCII de A-Z

**Geração de Números:**
- `Math.random()` gera número entre 0 e 1
- `Math.random() * 900000` gera número entre 0 e 899999
- `100000 + Math.random() * 900000` gera número entre 100000 e 999999
- `Math.floor()` arredonda para baixo

### Uso do Código

O mesmo código é usado em:
1. **QR Code** - Gerado pela biblioteca `qrcode`
2. **Código de Barras** - Gerado pela biblioteca `jsbarcode` (formato CODE128)
3. **Validação** - Usado para verificar entrada no evento

### Características

✅ **Único** - Cada voucher tem código diferente
✅ **Legível** - Formato fácil de ler e digitar
✅ **Compatível** - Funciona com QR Code e Barcode
✅ **Seguro** - Difícil de adivinhar (26² × 900000 × 26² = 548,576,000,000 combinações)

---

## 🔐 Modal de Login

### Quando Aparece

A modal aparece quando o usuário tenta comprar ingressos sem estar logado.

### Componentes Criados

1. **login-modal.ts** - Lógica do componente
2. **login-modal.html** - Template da modal
3. **login-modal.css** - Estilos e animações

### Fluxo de Funcionamento

```
Usuário clica em "Comprar Ingressos"
         ↓
Verifica se está logado
         ↓
    Não logado?
         ↓
  Mostra modal
         ↓
Usuário escolhe:
  - Fazer Login → Vai para /login
  - Criar Conta → Vai para /register
  - Cancelar → Fecha modal
```

### Integração

**event-details.ts:**
```typescript
goToTicketSelection() {
  // Verificar se o usuário está logado
  if (!this.authService.currentUser) {
    console.log('⚠️ Usuário não logado, mostrando modal');
    this.showLoginModal = true;
    return;
  }

  console.log('✅ Usuário logado, indo para seleção de ingressos');
  this.router.navigate(['/evento', this.eventId, 'ingressos']);
}
```

**event-details.html:**
```html
@if (showLoginModal) {
  <app-login-modal (close)="closeLoginModal()"></app-login-modal>
}
```

### Recursos da Modal

✅ **Design moderno** - Fundo escuro com blur
✅ **Animações suaves** - Fade in e slide up
✅ **Responsiva** - Funciona em mobile e desktop
✅ **Acessível** - Fecha ao clicar fora ou no X
✅ **Ícones** - Usa Lucide Icons para visual profissional

### Opções do Usuário

1. **Fazer Login** - Botão verde, redireciona para /login
2. **Criar Conta** - Botão branco, redireciona para /register
3. **Cancelar** - Texto cinza, fecha a modal

---

## 🎯 Resumo

### Código Único
- Formato: `XX999999XX` (10 caracteres)
- Usado em QR Code e Barcode
- Único para cada voucher
- 548 bilhões de combinações possíveis

### Modal de Login
- Aparece ao tentar comprar sem login
- Oferece login ou cadastro
- Design profissional e responsivo
- Integrada na página de detalhes do evento

### Segurança
- Código único previne fraudes
- Login obrigatório para compras
- Validação no evento via QR/Barcode
- Status do voucher (active/used/cancelled)
