# Página "Meus Ingressos"

## 🎫 Visão Geral

A página "Meus Ingressos" permite que usuários logados visualizem todos os ingressos que compraram, com informações detalhadas sobre cada evento.

## 🎨 Design e Layout

### Header do Usuário Logado

Quando o usuário está logado, o header exibe:

```
[Logo] [Eventos] [Como Funciona] [Ajuda]     [👤 Nome] [Meus Ingressos] [Sair]
```

**Elementos:**
- **Ícone do usuário**: Círculo verde (#13E785) com ícone de pessoa
- **Nome do usuário**: Exibido ao lado do ícone (oculto em mobile)
- **Botão "Meus Ingressos"**: Verde (#13E785) com ícone de ticket
- **Botão "Sair"**: Ícone de logout (oculto texto em mobile)

### Página de Ingressos

**Background:**
- Gradiente verde escuro (#07532F → #16201E)
- Padrão de pontos decorativos
- Círculos animados em verde

**Conteúdo:**
- Cards de ingressos em grid responsivo (1/2/3 colunas)
- Cada card mostra:
  - Imagem do evento
  - Quantidade de ingressos
  - Status do evento (badge colorido)
  - Título do evento
  - Data e local
  - Nome do comprador
  - Valor total pago
  - Data da compra
  - Botão "Ver Detalhes"

**Resumo:**
- Total de compras
- Total de ingressos adquiridos
- Total investido

## 📊 Status dos Eventos

Os ingressos são marcados com badges coloridos:

- **Verde** (Confirmado): Evento em mais de 30 dias
- **Amarelo** (Próximo): Evento entre 8-30 dias
- **Vermelho** (Em X dias): Evento em até 7 dias
- **Hoje!**: Evento acontece hoje
- **Cinza** (Realizado): Evento já passou

## 🔒 Proteção de Rota

A página verifica se o usuário está logado:
- Se não estiver logado → redireciona para `/login`
- Se estiver logado → carrega os ingressos

## 💾 Dados

### Atualmente (Mock)

Por enquanto, a página usa dados mockados para demonstração:
- 2 ingressos de exemplo
- Usa o nome e email do usuário logado
- Eventos fictícios

### Futura Integração Firebase

Quando integrar com Firebase, a página irá:
1. Buscar tickets do usuário no Firestore
2. Carregar dados dos eventos relacionados
3. Exibir ingressos reais comprados

## 🎯 Funcionalidades

### Implementadas
- ✅ Visualização de ingressos
- ✅ Cards com informações completas
- ✅ Status dinâmico baseado na data
- ✅ Resumo de compras
- ✅ Design responsivo
- ✅ Proteção de rota (requer login)
- ✅ Dados mockados para demonstração

### Futuras
- ⏳ Integração com Firebase
- ⏳ Download de PDF do ingresso
- ⏳ QR Code para validação
- ⏳ Compartilhar ingresso
- ⏳ Transferir ingresso
- ⏳ Cancelar ingresso
- ⏳ Filtros e busca
- ⏳ Ordenação por data/evento

## 🚀 Como Usar

### Para Testar

1. **Faça login** no sistema
2. Clique em **"Meus Ingressos"** no header
3. Veja os ingressos mockados
4. Explore os cards e informações

### Navegação

- **Header**: Clique em "Meus Ingressos"
- **URL direta**: `/meus-ingressos`
- **Sem ingressos**: Botão para voltar aos eventos

## 📱 Responsividade

### Mobile (< 640px)
- Cards em coluna única
- Nome do usuário oculto (só ícone)
- Texto "Sair" oculto (só ícone)
- Botão "Meus Ingressos" oculto (acessar via menu)

### Tablet (640px - 1024px)
- Cards em 2 colunas
- Todos os elementos visíveis

### Desktop (> 1024px)
- Cards em 3 colunas
- Layout completo
- Hover effects

## 🎨 Cores e Estilo

**Paleta:**
- Verde principal: #13E785
- Verde escuro: #07532F
- Fundo escuro: #16201E
- Cards: Branco com transparência (95%)

**Efeitos:**
- Backdrop blur nos cards
- Animação de hover (scale 1.05)
- Círculos animados no fundo
- Sombras suaves

## 💡 Dicas de Implementação Futura

### Integração com Firebase

```typescript
async loadTickets() {
  const userEmail = this.authService.currentUser?.email;
  if (userEmail) {
    // Buscar tickets do usuário
    const tickets = await this.firebaseService.getTicketsByEmail(userEmail);
    
    // Buscar dados dos eventos
    this.tickets = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await this.firebaseService.getEventById(ticket.eventId);
        return {
          ...ticket,
          eventTitle: event?.title,
          eventDate: event?.date,
          eventLocation: event?.location,
          eventImage: event?.imageUrl
        };
      })
    );
  }
}
```

### Adicionar ao FirebaseService

```typescript
async getTicketsByEmail(email: string): Promise<Ticket[]> {
  const q = query(
    collection(db, this.ticketsCollection),
    where('buyerEmail', '==', email)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    purchaseDate: doc.data()['purchaseDate'].toDate()
  } as Ticket));
}

async getEventById(id: string): Promise<Event | null> {
  const docRef = doc(db, this.eventsCollection, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data()['date'].toDate()
    } as Event;
  }
  return null;
}
```

## 🔐 Segurança

- Usuário só vê seus próprios ingressos
- Verificação de autenticação obrigatória
- Redirecionamento automático se não logado
- Dados filtrados por email do usuário

## 📝 Notas

- Os dados são mockados para demonstração
- Quando integrar com Firebase, remover os mocks
- A estrutura está pronta para receber dados reais
- O design segue o padrão visual do site
