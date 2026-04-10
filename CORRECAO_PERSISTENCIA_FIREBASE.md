# Correção: Persistência do Firebase Auth

## 🔴 Problema Identificado

Ao recarregar a página `/meus-ingressos`, o usuário era deslogado automaticamente e redirecionado para `/login`, mesmo estando autenticado.

### Logs do Problema

```
🔐 AuthGuard: Verificando autenticação...
⏳ AuthGuard: Aguardando Firebase processar autenticação...
⚠️ AuthGuard: Ainda sem usuário após aguardar
❌ AuthGuard: Usuário não autenticado, redirecionando para login
📊 Estado atual do AuthService.currentUser: null
🔧 AuthService: Inicializando onAuthStateChanged
🔐 Auth state changed: não autenticado
   - UID: undefined
   - Email: undefined
   - DisplayName: undefined
```

### Causa Raiz

O Firebase Auth não estava configurado com persistência explícita. Por padrão, o Firebase deveria usar `browserLocalPersistence`, mas em alguns casos (especialmente com SSR ou configurações específicas), a persistência não é aplicada automaticamente.

## ✅ Solução Implementada

### 1. Configuração Explícita de Persistência

**Arquivo:** `src/app/firebase.config.ts`

```typescript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Configurar persistência LOCAL (mantém login após reload)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase Auth: Persistência LOCAL configurada');
  })
  .catch((error) => {
    console.error('❌ Erro ao configurar persistência:', error);
  });
```

### 2. Logs Adicionados no Login

**Arquivo:** `src/app/services/auth.service.ts`

```typescript
async login(email: string, password: string): Promise<User> {
  console.log('🔐 Login: Iniciando login para', email);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  console.log('✅ Login: Sucesso! UID:', userCredential.user.uid);
  console.log('📦 Login: Verificando localStorage...');
  
  // Verificar se o token foi salvo
  setTimeout(() => {
    const keys = Object.keys(localStorage);
    const firebaseKeys = keys.filter(k => k.startsWith('firebase:'));
    console.log('🔑 Firebase keys no localStorage:', firebaseKeys.length);
  }, 500);
  
  return userCredential.user;
}
```

### 3. Logs Detalhados no AuthService

```typescript
constructor() {
  console.log('🔧 AuthService: Inicializando onAuthStateChanged');
  auth.onAuthStateChanged(user => {
    console.log('🔐 Auth state changed:', user ? user.email : 'não autenticado');
    console.log('   - UID:', user?.uid);
    console.log('   - Email:', user?.email);
    console.log('   - DisplayName:', user?.displayName);
    this.currentUserSubject.next(user);
  });
}
```

## 📋 Tipos de Persistência do Firebase

### browserLocalPersistence (Recomendado)
- Mantém o login mesmo após fechar o navegador
- Dados salvos no `localStorage`
- Persiste até logout explícito

### browserSessionPersistence
- Mantém o login apenas durante a sessão
- Dados salvos no `sessionStorage`
- Perde login ao fechar aba/navegador

### inMemoryPersistence
- Mantém o login apenas na memória
- Perde login ao recarregar página
- Usado para testes ou casos específicos

## 🔍 Como Verificar se Está Funcionando

### 1. Após fazer login, verifique o localStorage:

```javascript
// No console do navegador
Object.keys(localStorage).filter(k => k.startsWith('firebase:'))
```

Deve retornar algo como:
```
['firebase:authUser:AIzaSy...']
```

### 2. Logs esperados após login:

```
🔐 Login: Iniciando login para usuario@email.com
✅ Login: Sucesso! UID: Xj1xScJcvzN3fhyep62xxwKOpXh1
📦 Login: Verificando localStorage...
🔑 Firebase keys no localStorage: 1
```

### 3. Logs esperados ao recarregar página:

```
🔧 AuthService: Inicializando onAuthStateChanged
🔐 Auth state changed: usuario@email.com
   - UID: Xj1xScJcvzN3fhyep62xxwKOpXh1
   - Email: usuario@email.com
   - DisplayName: Nome do Usuário
🔐 AuthGuard: Verificando autenticação...
✅ AuthGuard: Usuário já autenticado (verificação imediata)
```

## 🎯 Resultado

✅ Usuário permanece logado após recarregar a página
✅ Token salvo no localStorage
✅ AuthGuard detecta usuário autenticado imediatamente
✅ Não há mais redirecionamento indesejado para /login

## 🔧 Troubleshooting

### Se ainda não funcionar:

1. **Limpe o cache do navegador:**
   - Ctrl + Shift + Delete
   - Limpar cookies e dados de sites

2. **Verifique se o localStorage está habilitado:**
   ```javascript
   console.log('localStorage disponível:', typeof localStorage !== 'undefined');
   ```

3. **Verifique se há erros no console:**
   - Procure por erros relacionados a Firebase
   - Verifique se a API Key está correta

4. **Teste em modo anônimo:**
   - Abra uma janela anônima
   - Faça login
   - Recarregue a página
   - Deve permanecer logado

## 📚 Referências

- [Firebase Auth Persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Firebase Auth State Management](https://firebase.google.com/docs/auth/web/manage-users)
