# Guia de Autenticação - Sistema de Ingressos

## Visão Geral

O sistema de autenticação foi implementado usando Firebase Authentication e Firestore, com cadastro completo de usuários e controle de acesso baseado em roles.

## Estrutura de Usuários

### Role: INGRESSO_CLIENT

Todos os usuários cadastrados recebem automaticamente a role `INGRESSO_CLIENT`, que identifica clientes do sistema de ingressos.

### Dados Armazenados

```typescript
{
  uid: string;              // ID único do Firebase Auth
  nome: string;             // Nome do usuário
  sobrenome: string;        // Sobrenome do usuário
  cpf: string;              // CPF (apenas números)
  email: string;            // Email (único)
  dataNascimento: Date;     // Data de nascimento
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;   // Opcional
    cidade: string;
    estado: string;         // Sigla (SP, RJ, etc)
  };
  role: 'INGRESSO_CLIENT';  // Role fixa
  createdAt: Date;          // Data de criação
}
```

## Validações Implementadas

### Cadastro

1. **Email único**: Não permite cadastro com email já existente
2. **CPF único**: Não permite cadastro com CPF já existente
3. **Idade mínima**: Usuário deve ter 18 anos ou mais
4. **Senha forte**: Mínimo de 6 caracteres
5. **Confirmação de senha**: Senhas devem coincidir
6. **Formatação de CPF**: Automática (000.000.000-00)
7. **Campos obrigatórios**: Todos exceto complemento

### Login

1. **Email válido**: Formato de email correto
2. **Credenciais**: Verificação no Firebase Auth

## Rotas Disponíveis

- `/register` - Página de cadastro
- `/login` - Página de login

## Como Usar no Código

### Verificar se usuário está logado

```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.currentUser) {
    console.log('Usuário logado:', this.authService.currentUser);
  }
}
```

### Obter dados completos do usuário

```typescript
async getUserData() {
  if (this.authService.currentUser) {
    const userData = await this.authService.getUserData(
      this.authService.currentUser.uid
    );
    console.log('Dados do usuário:', userData);
  }
}
```

### Fazer logout

```typescript
async logout() {
  await this.authService.logout();
  this.router.navigate(['/login']);
}
```

## Segurança

### Regras do Firestore

```javascript
// Usuários só podem ler seus próprios dados
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.uid;
  allow create: if request.auth != null;
  allow update: if request.auth != null && request.auth.uid == resource.data.uid;
}
```

### Boas Práticas

1. Nunca exponha credenciais do Firebase no frontend
2. Use variáveis de ambiente para configurações sensíveis
3. Implemente rate limiting no backend
4. Adicione verificação de email (opcional)
5. Implemente recuperação de senha

## Próximas Melhorias

- [ ] Verificação de email
- [ ] Recuperação de senha
- [ ] Login com Google/Facebook
- [ ] Perfil de usuário editável
- [ ] Histórico de compras do usuário
- [ ] Sistema de favoritos
- [ ] Notificações por email

## Testando o Sistema

1. Acesse `/register`
2. Preencha todos os campos
3. Clique em "Criar Conta"
4. Você será redirecionado automaticamente
5. Acesse `/login` para testar o login

## Tratamento de Erros

O sistema trata os seguintes erros:

- Email já cadastrado
- CPF já cadastrado
- Email inválido
- Senha fraca
- Usuário não encontrado
- Senha incorreta
- Conta desativada
- Idade insuficiente
- Campos obrigatórios vazios
