import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock, Info, Ticket, Shield, RefreshCw, Loader2 } from 'lucide-angular';
import { EventService, Event as FirebaseEvent, TicketType as FirebaseTicketType } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../../components/login-modal/login-modal';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted?: string;
  available: number;
  batch: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  dateFormatted?: string;
  timeFormatted?: string;
  location: string;
  address: string;
  imageUrl: string;
  availableTickets: number;
  ticketTypes: TicketType[];
  minPrice?: string;
}

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, LoginModalComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetailsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Info = Info;
  readonly Ticket = Ticket;
  readonly Shield = Shield;
  readonly RefreshCw = RefreshCw;
  readonly Loader2 = Loader2;

  event: Event | null = null;
  loading = true;
  eventId: string = '';
  showLoginModal = false;
  private isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    console.log('📍 EventDetails: Event ID:', this.eventId);
    this.loadEvent();
  }

  async loadEvent() {
    // Prevenir múltiplas chamadas simultâneas
    if (this.isLoading) {
      console.log('⏳ EventDetails: Já está carregando, ignorando chamada duplicada');
      return;
    }

    this.isLoading = true;
    this.loading = true;
    
    try {
      console.log('🔄 EventDetails: Buscando evento do Firebase...');
      const firebaseEvent = await this.eventService.getEventById(this.eventId);
      
      if (!firebaseEvent) {
        console.error('❌ EventDetails: Evento não encontrado');
        this.loading = false;
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      console.log('✅ EventDetails: Evento encontrado:', firebaseEvent.title);

      // Pré-processar TODOS os dados
      const processedTicketTypes: TicketType[] = firebaseEvent.ticketTypes.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        priceFormatted: ticket.price.toFixed(2),
        available: ticket.available,
        batch: ticket.batch
      }));
      
      const totalAvailable = processedTicketTypes.reduce((sum, t) => sum + t.available, 0);
      const minPrice = Math.min(...processedTicketTypes.map(t => t.price));
      
      // Criar objeto completamente processado
      this.event = {
        id: firebaseEvent.id,
        title: firebaseEvent.title,
        description: firebaseEvent.description,
        date: firebaseEvent.date,
        dateFormatted: this.formatDate(firebaseEvent.date),
        timeFormatted: `${firebaseEvent.startTime} - ${firebaseEvent.endTime}`,
        location: `${firebaseEvent.city} - ${firebaseEvent.state}`,
        address: firebaseEvent.location,
        imageUrl: firebaseEvent.image,
        availableTickets: totalAvailable,
        ticketTypes: processedTicketTypes,
        minPrice: minPrice.toFixed(2)
      };
      
      console.log('✅ EventDetails: Dados processados com sucesso');
      this.loading = false;
      this.isLoading = false;
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('❌ EventDetails: Erro ao carregar evento:', error);
      this.loading = false;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  goToTicketSelection() {
    // Verificar se o usuário está logado
    if (!this.authService.currentUser) {
      console.log('⚠️ Usuário não logado, mostrando modal');
      this.showLoginModal = true;
      return;
    }

    console.log('✅ Usuário logado, indo para seleção de ingressos');
    this.router.navigate(['/evento', this.eventId, 'ingressos']);
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }
}
