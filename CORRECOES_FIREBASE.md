# Correções Firebase - Índices e Cards Dinâmicos

## Problemas corrigidos

### 1. Erro de índice composto no Firestore
**Problema**: O Firestore exigia índices compostos para queries com `where()` + `orderBy()`.

**Solução**: Removemos as queries compostas e fazemos a ordenação no lado do cliente:

```typescript
// ANTES (exigia índice)
const q = query(
  eventsRef,
  where('featured', '==', true),
  orderBy('date', 'asc')
);

// DEPOIS (sem necessidade de índice)
const querySnapshot = await getDocs(eventsRef);
const events = querySnapshot.docs
  .map(doc => /* mapear dados */)
  .filter(event => event.featured)
  .sort((a, b) => a.date.getTime() - b.date.getTime());
```

### 2. Cards mockados no Hero Component
**Problema**: Os 3 cards ao lado do texto "Encontre os melhores eventos" estavam com dados fixos.

**Solução**: Atualizamos o `HeroComponent` para buscar os 3 primeiros eventos do Firebase dinamicamente.

## Mudanças implementadas

### EventService (`src/app/services/event.service.ts`)
Atualizamos 3 métodos para evitar índices compostos:

1. `getAllEvents()` - Busca todos e ordena no cliente
2. `getFeaturedEvents()` - Busca todos, filtra featured e ordena no cliente
3. `getEventsByCategory()` - Busca por categoria e ordena no cliente

### HeroComponent (`src/app/components/hero/`)
- Adicionado `OnInit` lifecycle
- Injetado `EventService` e `Router`
- Método `loadEvents()` busca os 3 primeiros eventos
- Formatação de data, preço e status
- Cards agora são clicáveis e navegam para a página do evento
- Estado de loading enquanto busca dados

### Template do Hero
- Substituídos os 3 cards fixos por um loop `@for`
- Adicionado estado de loading com spinner
- Adicionado estado vazio quando não há eventos
- Cards agora usam dados dinâmicos do Firebase

## Benefícios

1. **Sem necessidade de índices**: Queries simples que não exigem configuração adicional no Firestore
2. **Dados dinâmicos**: Todos os cards agora refletem os eventos reais do banco
3. **Melhor UX**: Loading states e navegação funcional
4. **Escalável**: Funciona com qualquer quantidade de eventos

## Regras do Firestore

Suas regras atuais permitem leitura/escrita até 7 de maio de 2026:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 5, 7);
    }
  }
}
```

**Recomendação**: Antes dessa data, implemente regras de segurança adequadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Eventos - leitura pública, escrita apenas autenticados
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Compras - apenas o dono pode ler/escrever
    match /purchases/{purchaseId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
    }
  }
}
```

## Testando

1. Execute a aplicação: `npm start`
2. Verifique o banner - deve mostrar o Festival Ressuscitou 2026
3. Verifique os cards ao lado do hero - devem mostrar eventos do Firebase
4. Verifique a listagem de eventos - deve mostrar todos os eventos
5. Não deve haver mais erros de índice no console
