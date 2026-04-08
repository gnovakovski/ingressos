# Sistema de Navegação e Autenticação

## Implementação Completa ✅

### Auth Guard
- **Arquivo**: `src/app/guards/auth.guard.ts`
- **Função**: Protege rotas que requerem autenticação
- **Comportamento**:
  - Verifica se o usuário está logado
  - Se não estiver, salva a URL atual em `sessionStorage`
  - Redireciona para `/login`

### Rotas Protegidas
As seguintes rotas requerem autenticação:
- `/evento/:id/ingressos` - Seleção de ingressos
- `/pagamento` - Página de pagamento
- `/meus-ingressos` - Meus ingressos

### Rotas Públicas
- `/` - Home (landing page)
- `/evento/:id` - Detalhes do evento
- `/login` - Login
- `/register` - Cadastro

## Fluxo de Redirecionamento

### Cenário 1: Usuário Deslogado Tenta Comprar Ingresso
1. Usuário clica em "Selecionar Ingressos" no evento
2. Auth Guard intercepta e salva URL: `/evento/1/ingressos`
3. Redireciona para `/login`
4. Usuário faz login
5. Sistema redireciona automaticamente para `/evento/1/ingressos`

### Cenário 2: Usuário Vai para Cadastro
1. Usuário está na tela de login (com redirectUrl salva)
2. Clica em "Cadastre-se"
3. Sistema mantém a redirectUrl no sessionStorage
4. Após cadastro bem-sucedido, redireciona para URL original

### Cenário 3: Login/Cadastro Direto
1. Usuário acessa `/login` ou `/register` diretamente
2. Faz login/cadastro
3. Redireciona para home (`/`)

## Implementação Técnica

### Login Component
```typescript
async onSubmit() {
  await this.authService.login(this.email, this.password);
  
  const redirectUrl = sessionStorage.getItem('redirectUrl');
  
  if (redirectUrl) {
    sessionStorage.removeItem('redirectUrl');
    this.router.navigateByUrl(redirectUrl);
  } else {
    this.router.navigate(['/']);
  }
}

goToRegister() {
  // Mantém redirectUrl ao navegar para cadastro
  this.router.navigate(['/register']);
}
```

### Register Component
```typescript
async onSubmit() {
  await this.authService.register(...);
  
  const redirectUrl = sessionStorage.getItem('redirectUrl');
  
  if (redirectUrl) {
    sessionStorage.removeItem('redirectUrl');
    setTimeout(() => {
      this.router.navigateByUrl(redirectUrl);
    }, 1500);
  } else {
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }
}

goToLogin() {
  // Mantém redirectUrl ao navegar para login
  this.router.navigate(['/login']);
}
```

## Testes Recomendados

1. **Teste de Redirecionamento Básico**:
   - Deslogar
   - Ir para um evento
   - Clicar em "Selecionar Ingressos"
   - Fazer login
   - Verificar se foi redirecionado para seleção de ingressos

2. **Teste com Cadastro**:
   - Deslogar
   - Tentar acessar rota protegida
   - Clicar em "Cadastre-se" no login
   - Completar cadastro
   - Verificar se foi redirecionado para rota original

3. **Teste de Login Direto**:
   - Acessar `/login` diretamente
   - Fazer login
   - Verificar se foi para home

4. **Teste de Múltiplas Tentativas**:
   - Tentar acessar rota protegida
   - Ir para cadastro
   - Voltar para login
   - Fazer login
   - Verificar se redirectUrl ainda funciona

## Observações

- O `sessionStorage` é usado (não `localStorage`) para que a URL seja esquecida ao fechar o navegador
- Links entre login e cadastro usam `router.navigate()` ao invés de `<a href>` para preservar o estado
- O guard é aplicado no nível de rota no `app.routes.ts`
- Usuários deslogados podem ver eventos e detalhes, mas não podem comprar
