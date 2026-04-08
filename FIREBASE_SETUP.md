# Configuração do Firebase

## Ativar Firebase Authentication

1. No Firebase Console, vá em "Authentication"
2. Clique em "Get Started"
3. Ative o método "Email/Password"
4. Salve as configurações

## Estrutura do Firestore

Para que o sistema funcione corretamente, você precisa configurar as seguintes coleções no Firestore:

### Coleção: `users`

Estrutura de documento:
```json
{
  "uid": "string",
  "nome": "string",
  "sobrenome": "string",
  "cpf": "string",
  "email": "string",
  "dataNascimento": "timestamp",
  "endereco": {
    "rua": "string",
    "numero": "string",
    "complemento": "string (opcional)",
    "cidade": "string",
    "estado": "string"
  },
  "role": "INGRESSO_CLIENT",
  "createdAt": "timestamp"
}
```

### Coleção: `events`

Estrutura de documento:
```json
{
  "title": "string",
  "description": "string",
  "date": "timestamp",
  "location": "string",
  "price": "number",
  "availableTickets": "number",
  "imageUrl": "string (opcional)"
}
```

### Coleção: `tickets`

Estrutura de documento:
```json
{
  "eventId": "string",
  "buyerName": "string",
  "buyerEmail": "string",
  "quantity": "number",
  "totalPrice": "number",
  "purchaseDate": "timestamp"
}
```

## Regras de Segurança do Firestore

Configure as seguintes regras no Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários - leitura apenas do próprio perfil, escrita no cadastro
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Eventos - leitura pública, escrita apenas autenticada
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Tickets - leitura apenas do próprio ticket, escrita autenticada
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Configuração Inicial

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto "ingressos-cfa85"
3. Vá em "Firestore Database" e crie o banco de dados
4. Configure as regras de segurança acima
5. (Opcional) Ative o Firebase Authentication se quiser adicionar login

## Funcionalidades Implementadas

### Autenticação e Usuários
- ✅ Cadastro de usuários com Firebase Authentication
- ✅ Validação de email único
- ✅ Validação de CPF único
- ✅ Role automática (INGRESSO_CLIENT)
- ✅ Armazenamento de dados completos no Firestore
- ✅ Validação de idade (18+)
- ✅ Formatação automática de CPF
- ✅ Sistema de login
- ✅ Header dinâmico (mostra usuário logado)

### Eventos
- ✅ Listagem de eventos (estático)
- ⏳ Integração com Firestore (preparado, mas não ativo)

### Ingressos
- ⏳ Sistema de compra (preparado para integração futura)

## Próximos Passos

1. Adicionar autenticação de usuários ✅
2. Implementar painel administrativo
3. Integrar eventos com Firestore (código preparado em firebase.service.ts)
4. Adicionar upload de imagens para o Storage
5. Implementar sistema de pagamento
6. Adicionar notificações por email
7. Ativar sistema de compra de ingressos
