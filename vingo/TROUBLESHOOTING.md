# Troubleshooting - Sistema de Autenticação

## 🔧 Problemas Comuns e Soluções

### 1. Header não atualiza após login

**Problema:** Após fazer login, o header continua mostrando "Entrar" e "Cadastrar" ao invés do nome do usuário.

**Solução Implementada:**
- ✅ AuthService agora usa `BehaviorSubject` para notificar mudanças
- ✅ Header se inscreve no `currentUser$` observable
- ✅ Atualização automática quando o estado de autenticação muda

**Como funciona:**
```typescript
// AuthService
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// Header Component
this.authService.currentUser$.subscribe(user => {
  if (user) {
    this.isLoggedIn = true;
    this.userName = user.displayName || 'Usuário';
  } else {
    this.isLoggedIn = false;
    this.userName = '';
  }
});
```

### 2. Redirecionamento não funciona

**Problema:** Após login/cadastro, a página não redireciona.

**Solução:**
- Adicionado delay de 500ms no login
- Adicionado delay de 1500ms no cadastro
- Isso garante que o Firebase atualize o estado antes do redirecionamento

**Código:**
```typescript
await this.authService.login(email, password);
setTimeout(() => {
  this.router.navigate(['/']);
}, 500);
```

### 3. Firebase não inicializado

**Problema:** Erro "Firebase not initialized" ou similar.

**Verificações:**
1. Confirme que `firebase.config.ts` existe e está correto
2. Verifique se as credenciais do Firebase estão corretas
3. Certifique-se de que o Firebase Authentication está ativado no console

**Solução:**
```typescript
// firebase.config.ts deve ter:
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { /* suas credenciais */ };
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 4. Erro "auth/invalid-credential"

**Problema:** Erro ao tentar fazer login.

**Causas possíveis:**
- Email ou senha incorretos
- Usuário não existe
- Firebase Authentication não está ativado

**Solução:**
1. Verifique se o usuário foi cadastrado corretamente
2. Confirme que o Firebase Authentication está ativo
3. Verifique no Firebase Console se o usuário existe

### 5. Estado de autenticação não persiste

**Problema:** Ao recarregar a página, o usuário é deslogado.

**Solução:**
O Firebase já persiste automaticamente o estado. Se isso não estiver funcionando:

1. Verifique se há erros no console
2. Limpe o cache do navegador
3. Verifique as configurações de cookies do navegador

### 6. Nome do usuário não aparece

**Problema:** Header mostra "Usuário" ao invés do nome real.

**Causa:** O `displayName` não foi definido no cadastro.

**Verificação:**
```typescript
// No AuthService, após criar o usuário:
await updateProfile(userCredential.user, {
  displayName: `${userData.nome} ${userData.sobrenome}`
});
```

### 7. Página "Meus Ingressos" não carrega

**Problema:** Ao clicar em "Meus Ingressos", a página não abre.

**Verificações:**
1. Confirme que a rota está configurada em `app.routes.ts`
2. Verifique se o usuário está logado
3. Veja o console para erros

**Solução:**
```typescript
// app.routes.ts deve ter:
{
  path: 'meus-ingressos',
  component: MyTicketsComponent
}
```

## 🧪 Como Testar

### Teste Completo de Autenticação

1. **Cadastro:**
   ```
   - Acesse /register
   - Preencha todos os campos
   - Clique em "Criar Conta"
   - Aguarde mensagem de sucesso
   - Deve redirecionar para home
   - Header deve mostrar seu nome
   ```

2. **Logout:**
   ```
   - Clique em "Sair" no header
   - Header deve voltar a mostrar "Entrar" e "Cadastrar"
   - Deve permanecer na página atual
   ```

3. **Login:**
   ```
   - Acesse /login
   - Digite email e senha
   - Clique em "Entrar"
   - Deve redirecionar para home
   - Header deve mostrar seu nome
   ```

4. **Persistência:**
   ```
   - Faça login
   - Recarregue a página (F5)
   - Header deve continuar mostrando seu nome
   ```

5. **Meus Ingressos:**
   ```
   - Estando logado, clique em "Meus Ingressos"
   - Deve abrir a página com ingressos mockados
   - Deve mostrar 2 ingressos de exemplo
   ```

## 🔍 Debug

### Console do Navegador

Abra o console (F12) e procure por:

**Erros comuns:**
- `Firebase: Error (auth/...)` - Erro de autenticação
- `Cannot read property 'displayName'` - Usuário não carregado
- `Navigation cancelled` - Problema de roteamento

**Logs úteis:**
```typescript
// Adicione no AuthService para debug:
constructor() {
  auth.onAuthStateChanged(user => {
    console.log('Auth state changed:', user);
    this.currentUserSubject.next(user);
  });
}
```

### Firebase Console

Verifique:
1. **Authentication** → Veja se o usuário foi criado
2. **Firestore** → Coleção `users` → Veja os dados do usuário
3. **Rules** → Verifique se as regras estão corretas

## 📝 Checklist de Configuração

- [ ] Firebase Authentication ativado
- [ ] Método Email/Password habilitado
- [ ] Firestore Database criado
- [ ] Regras de segurança configuradas
- [ ] Credenciais corretas em `firebase.config.ts`
- [ ] Rotas configuradas em `app.routes.ts`
- [ ] Header importado no `app.html`
- [ ] RouterOutlet presente no `app.html`

## 🆘 Ainda com Problemas?

1. **Limpe o cache:**
   ```bash
   # Pare o servidor
   Ctrl + C
   
   # Limpe o cache do Angular
   rm -rf .angular/cache
   
   # Reinstale dependências
   npm install
   
   # Inicie novamente
   npm start
   ```

2. **Verifique as versões:**
   ```bash
   npm list firebase
   npm list @angular/core
   ```

3. **Console do Firebase:**
   - Vá em Authentication
   - Veja se há usuários cadastrados
   - Tente fazer login com um usuário existente

4. **Teste com dados mockados:**
   - Comente temporariamente a integração com Firebase
   - Use dados estáticos para testar o fluxo
   - Isso ajuda a identificar se o problema é no Firebase ou no código

## 💡 Dicas

- Use o modo anônimo do navegador para testar sem cache
- Verifique se não há bloqueadores de cookies ativos
- Teste em diferentes navegadores
- Mantenha o console do Firebase aberto durante os testes
- Use o Redux DevTools para ver o estado da aplicação (se instalado)
