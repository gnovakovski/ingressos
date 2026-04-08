# Como Usar o Sistema de Cadastro

## 🚀 Início Rápido

### 1. Configurar Firebase

Antes de usar o sistema de cadastro, você precisa configurar o Firebase:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto "ingressos-cfa85"
3. Ative o **Firebase Authentication**:
   - Vá em "Authentication" → "Get Started"
   - Ative o método "Email/Password"
4. Configure o **Firestore Database**:
   - Vá em "Firestore Database" → "Create Database"
   - Escolha o modo de produção
   - Selecione a localização
5. Configure as **Regras de Segurança** (veja FIREBASE_SETUP.md)

### 2. Executar o Projeto

```bash
npm install
npm start
```

O projeto estará disponível em `http://localhost:4200`

## 📝 Funcionalidades

### Cadastro de Usuário

**Rota**: `/register`

**Campos obrigatórios**:
- Nome
- Sobrenome
- CPF (formatação automática)
- Email
- Data de Nascimento (18+ anos)
- Senha (mínimo 6 caracteres)
- Confirmação de Senha
- Endereço completo (rua, número, cidade, estado)

**Validações**:
- ✅ Email único (não permite duplicados)
- ✅ CPF único (não permite duplicados)
- ✅ Idade mínima de 18 anos
- ✅ Senhas devem coincidir
- ✅ Formatação automática de CPF

**Após cadastro**:
- Usuário é criado no Firebase Authentication
- Dados completos são salvos no Firestore (coleção `users`)
- Role `INGRESSO_CLIENT` é atribuída automaticamente
- Redirecionamento automático para a home

### Login

**Rota**: `/login`

**Campos**:
- Email
- Senha

**Funcionalidades**:
- Autenticação via Firebase Auth
- Mensagens de erro amigáveis
- Redirecionamento após login

### Header Dinâmico

O header muda automaticamente baseado no estado de autenticação:

**Usuário não logado**:
- Botão "Entrar"
- Botão "Cadastrar"

**Usuário logado**:
- Nome do usuário
- Botão "Sair"

## 🎨 Design

### Responsividade

O sistema é 100% responsivo:
- **Mobile**: Layout em coluna única, botões full-width
- **Tablet**: Layout em 2 colunas para formulários
- **Desktop**: Layout otimizado com espaçamento adequado

### Cores e Estilo

- Gradiente principal: Purple → Pink → Orange
- Cor de destaque: #13E785 (verde Vingo)
- Ícones: Lucide Angular
- Animações suaves em todos os elementos

## 🔒 Segurança

### Dados Protegidos

- Senhas são criptografadas pelo Firebase Auth
- CPF armazenado apenas com números (sem formatação)
- Email convertido para lowercase

### Regras do Firestore

```javascript
// Usuários só podem ler seus próprios dados
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.uid;
  allow create: if request.auth != null;
  allow update: if request.auth != null && request.auth.uid == resource.data.uid;
}
```

## 📊 Estrutura de Dados

### Coleção: users

```json
{
  "uid": "firebase-auth-uid",
  "nome": "João",
  "sobrenome": "Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "dataNascimento": "1990-01-01T00:00:00.000Z",
  "endereco": {
    "rua": "Rua Exemplo",
    "numero": "123",
    "complemento": "Apto 45",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "role": "INGRESSO_CLIENT",
  "createdAt": "2026-04-07T00:00:00.000Z"
}
```

## 🧪 Testando

### Teste de Cadastro

1. Acesse `http://localhost:4200/register`
2. Preencha todos os campos
3. Use um email válido e único
4. Use um CPF válido (11 dígitos)
5. Senha com no mínimo 6 caracteres
6. Clique em "Criar Conta"

### Teste de Login

1. Acesse `http://localhost:4200/login`
2. Use o email e senha cadastrados
3. Clique em "Entrar"

### Verificar no Firebase

1. Acesse o Firebase Console
2. Vá em "Authentication" → veja o usuário criado
3. Vá em "Firestore Database" → veja os dados na coleção `users`

## ⚠️ Possíveis Erros

### "Este email já está cadastrado"
- O email já existe no sistema
- Use outro email ou faça login

### "Este CPF já está cadastrado"
- O CPF já existe no sistema
- Verifique se você já tem cadastro

### "Você deve ter pelo menos 18 anos"
- Data de nascimento indica idade menor que 18
- Sistema não permite cadastro de menores

### "As senhas não coincidem"
- Senha e confirmação estão diferentes
- Digite novamente com atenção

## 🔄 Próximos Passos

Após configurar o cadastro, você pode:

1. Implementar recuperação de senha
2. Adicionar verificação de email
3. Criar perfil de usuário editável
4. Implementar histórico de compras
5. Adicionar sistema de favoritos

## 📚 Documentação Adicional

- `FIREBASE_SETUP.md` - Configuração detalhada do Firebase
- `AUTHENTICATION_GUIDE.md` - Guia completo de autenticação
- Documentação oficial: [Firebase Docs](https://firebase.google.com/docs)
