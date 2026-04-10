import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, Plus, Minus, Trash2, User, Calendar, CreditCard, ShoppingCart, AlertCircle, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { VoucherService } from '../../services/voucher.service';

interface TicketType {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  available: number;
  batch: string;
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
  styleUrl: './ticket-selection.css'
})
export class TicketSelectionComponent implements OnInit, OnDestroy {
  readonly Plus = Plus;
  readonly Minus = Minus;
  readonly Trash2 = Trash2;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly CreditCard = CreditCard;
  readonly ShoppingCart = ShoppingCart;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;

  eventId: string = '';
  eventTitle: string = '';
  ticketTypes: TicketType[] = [];
  selectedTickets: TicketPerson[] = [];
  isCheckingAuth = true;
  isLoggedIn = false;
  private authSubscription?: Subscription;
  error: string = '';
  loading = true;
  private isLoadingTickets = false;
  
  private platformId = inject(PLATFORM_ID);
  
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
    private eventService: EventService,
    private voucherService: VoucherService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🎟️ TicketSelectionComponent: ngOnInit chamado');
    
    // Aguardar AuthService inicializar
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Inscrever-se nas mudanças de autenticação
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isCheckingAuth = false;
      
      if (user) {
        this.isLoggedIn = true;
        console.log('✅ TicketSelection: Usuário autenticado, carregando ingressos');
        this.initializeComponent();
      } else {
        this.isLoggedIn = false;
        console.log('❌ TicketSelection: Usuário não autenticado, redirecionando');
        this.router.navigate(['/login']);
      }
      
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async initializeComponent() {
    // Prevenir múltiplas inicializações
    if (this.isLoadingTickets) {
      console.log('⏳ TicketSelection: Já está inicializando, ignorando chamada duplicada');
      return;
    }

    this.isLoadingTickets = true;
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    await this.loadTicketTypes();
    await this.addTicketForCurrentUser();
    
    this.loading = false;
    this.isLoadingTickets = false;
    this.cdr.detectChanges();
  }

  async loadTicketTypes() {
    try {
      console.log('🎫 TicketSelection: Carregando tipos de ingresso...');
      const event = await this.eventService.getEventById(this.eventId);
      
      if (!event) {
        console.error('❌ TicketSelection: Evento não encontrado');
        return;
      }

      console.log('✅ TicketSelection: Evento encontrado:', event.title);
      this.eventTitle = event.title;
      
      // Pré-processar preços
      this.ticketTypes = event.ticketTypes.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        priceFormatted: ticket.price.toFixed(2),
        available: ticket.available,
        batch: ticket.batch
      }));
      
      console.log('✅ TicketSelection: Tipos de ingresso carregados:', this.ticketTypes.length);
      
    } catch (error) {
      console.error('❌ TicketSelection: Erro ao carregar tipos de ingresso:', error);
    }
  }

  async addTicketForCurrentUser() {
    const user = this.authService.currentUser;
    if (!user || this.ticketTypes.length === 0) return;

    // Buscar dados completos do usuário no Firestore
    try {
      const userData = await this.authService.getUserData(user.uid);
      
      if (userData) {
        // Formatar CPF
        const cpfFormatted = this.formatCpfValue(userData.cpf);
        
        // Formatar data de nascimento para o formato do input date (YYYY-MM-DD)
        const birthDate = userData.dataNascimento;
        const birthDateFormatted = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
        
        this.addTicket(this.ticketTypes[0].id, `${userData.nome} ${userData.sobrenome}`, cpfFormatted, birthDateFormatted);
      } else {
        // Fallback se não encontrar dados no Firestore
        this.addTicket(this.ticketTypes[0].id, user.displayName || 'Usuário', '', '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Fallback em caso de erro
      this.addTicket(this.ticketTypes[0].id, user.displayName || 'Usuário', '', '');
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

  async goToPayment() {
    if (!this.validateTickets()) {
      return;
    }

    this.loading = true;

    try {
      // Buscar dados do evento
      const event = await this.eventService.getEventById(this.eventId);
      if (!event) {
        this.error = 'Evento não encontrado';
        this.loading = false;
        return;
      }

      const user = this.authService.currentUser;
      if (!user) {
        this.error = 'Usuário não autenticado';
        this.loading = false;
        return;
      }

      // Preparar dados dos ingressos
      const tickets = this.selectedTickets.map(ticket => {
        const ticketType = this.ticketTypes.find(t => t.id === ticket.ticketTypeId);
        return {
          ticketType: ticket.ticketTypeName,
          ticketBatch: ticketType?.batch || 'Primeiro Lote',
          price: ticket.price,
          participantName: ticket.name,
          participantCpf: ticket.cpf,
          participantBirthDate: ticket.birthDate,
          ticketTypeId: ticket.ticketTypeId // Adicionar ID para decrementar estoque
        };
      });

      // Criar vouchers
      console.log('🎫 Gerando vouchers...');
      await this.voucherService.createVouchers(
        user.uid,
        this.eventId,
        event.title,
        event.date,
        `${event.city} - ${event.state}`,
        event.location,
        tickets
      );

      console.log('✅ Vouchers gerados com sucesso!');

      // Limpar sessionStorage (apenas no browser)
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.removeItem('selectedTickets');
        sessionStorage.removeItem('eventId');
        sessionStorage.removeItem('eventTitle');
      }

      // Redirecionar para Meus Ingressos
      this.router.navigate(['/meus-ingressos']);

    } catch (error) {
      console.error('❌ Erro ao gerar vouchers:', error);
      this.error = 'Erro ao processar ingressos. Tente novamente.';
      this.loading = false;
    }
  }
}
