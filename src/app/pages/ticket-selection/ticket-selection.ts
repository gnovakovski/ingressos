import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Plus, Minus, Trash2, User, Calendar, CreditCard, ShoppingCart, AlertCircle } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

interface TicketType {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  available: number;
}

interface TicketPerson {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  priceFormatted: string;
  name: string;
  cpf: string;
  birthDate: string;
}

@Component({
  selector: 'app-ticket-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ticket-selection.html',
  styleUrl: './ticket-selection.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketSelectionComponent implements OnInit {
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly CreditCard = CreditCard;
  readonly ShoppingCart = ShoppingCart;
  readonly AlertCircle = AlertCircle;

  eventId: string = '';
  eventTitle: string = 'Festival Eletrônica 2026';
  ticketTypes: TicketType[] = [];
  selectedTickets: TicketPerson[] = [];
  error: string = '';
  
  // Propriedades computadas para evitar chamadas de função no template
  get totalPrice(): string {
    const total = this.selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    return total.toFixed(2);
  }
  
  get ticketCount(): number {
    return this.selectedTickets.length;
  }
  
  get ticketSummary(): Array<{typeId: string, typeName: string, count: number, subtotal: string}> {
    const summary: {[key: string]: {typeId: string, typeName: string, count: number, price: number}} = {};
    
    this.selectedTickets.forEach(ticket => {
      if (!summary[ticket.ticketTypeId]) {
        summary[ticket.ticketTypeId] = {
          typeId: ticket.ticketTypeId,
          typeName: ticket.ticketTypeName,
          count: 0,
          price: ticket.price
        };
      }
      summary[ticket.ticketTypeId].count++;
    });
    
    return Object.values(summary).map(item => ({
      typeId: item.typeId,
      typeName: item.typeName,
      count: item.count,
      subtotal: (item.price * item.count).toFixed(2)
    }));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.authService.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTicketTypes();
    await this.addTicketForCurrentUser();
  }

  loadTicketTypes() {
    // Mock data - substituir por chamada ao Firebase
    const rawTickets = [
      { id: '1', name: 'Pista', price: 120.00, available: 300 },
      { id: '2', name: 'Front Stage', price: 200.00, available: 150 },
      { id: '3', name: 'Camarote', price: 350.00, available: 50 }
    ];
    
    // Pré-processar preços
    this.ticketTypes = rawTickets.map(ticket => ({
      ...ticket,
      priceFormatted: ticket.price.toFixed(2)
    }));
  }

  async addTicketForCurrentUser() {
    const user = this.authService.currentUser;
    if (!user) return;

    // Buscar dados completos do usuário no Firestore
    try {
      const userData = await this.authService.getUserData(user.uid);
      
      if (userData) {
        // Formatar CPF
        const cpfFormatted = this.formatCpfValue(userData.cpf);
        
        // Formatar data de nascimento para o formato do input date (YYYY-MM-DD)
        const birthDate = userData.dataNascimento;
        const birthDateFormatted = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
        
        this.addTicket('1', `${userData.nome} ${userData.sobrenome}`, cpfFormatted, birthDateFormatted);
      } else {
        // Fallback se não encontrar dados no Firestore
        this.addTicket('1', user.displayName || 'Usuário', '', '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Fallback em caso de erro
      this.addTicket('1', user.displayName || 'Usuário', '', '');
    }
  }

  formatCpfValue(cpf: string): string {
    // Remove tudo que não é dígito
    const cleaned = cpf.replace(/\D/g, '');
    
    // Formata o CPF
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  }

  addTicket(ticketTypeId: string, name: string = '', cpf: string = '', birthDate: string = '') {
    const ticketType = this.ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) return;

    const newTicket: TicketPerson = {
      id: Date.now().toString(),
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      price: ticketType.price,
      priceFormatted: ticketType.price.toFixed(2),
      name,
      cpf,
      birthDate
    };

    this.selectedTickets.push(newTicket);
    this.cdr.markForCheck(); // Notificar mudança para OnPush
  }

  addNewTicket() {
    if (this.ticketTypes.length > 0) {
      this.addTicket(this.ticketTypes[0].id);
    }
  }

  removeTicket(ticketId: string) {
    this.selectedTickets = this.selectedTickets.filter(t => t.id !== ticketId);
    this.cdr.markForCheck(); // Notificar mudança para OnPush
  }

  changeTicketType(ticket: TicketPerson, newTypeId: string) {
    const ticketType = this.ticketTypes.find(t => t.id === newTypeId);
    if (ticketType) {
      ticket.ticketTypeId = ticketType.id;
      ticket.ticketTypeName = ticketType.name;
      ticket.price = ticketType.price;
    }
  }

  formatCpf(event: any, ticket: TicketPerson) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    ticket.cpf = value;
  }

  getTotalPrice(): number {
    return this.selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  }

  getTicketTypeCount(typeId: string): number {
    return this.selectedTickets.filter(t => t.ticketTypeId === typeId).length;
  }

  validateTickets(): boolean {
    this.error = '';

    if (this.selectedTickets.length === 0) {
      this.error = 'Adicione pelo menos um ingresso';
      return false;
    }

    for (const ticket of this.selectedTickets) {
      if (!ticket.name.trim()) {
        this.error = 'Preencha o nome de todos os participantes';
        return false;
      }
      if (!ticket.cpf || ticket.cpf.replace(/\D/g, '').length !== 11) {
        this.error = 'Preencha o CPF válido de todos os participantes';
        return false;
      }
      if (!ticket.birthDate) {
        this.error = 'Preencha a data de nascimento de todos os participantes';
        return false;
      }
    }

    return true;
  }

  goToPayment() {
    if (!this.validateTickets()) {
      return;
    }

    // Salvar dados no sessionStorage para usar na página de pagamento
    sessionStorage.setItem('selectedTickets', JSON.stringify(this.selectedTickets));
    sessionStorage.setItem('eventId', this.eventId);
    sessionStorage.setItem('eventTitle', this.eventTitle);

    this.router.navigate(['/pagamento']);
  }
}
