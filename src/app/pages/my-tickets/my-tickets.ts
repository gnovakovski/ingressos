import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, User, Ticket, TicketX, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';

interface TicketWithEvent {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  eventImage: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: Date;
}

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css'
})
export class MyTicketsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly User = User;
  readonly Ticket = Ticket;
  readonly TicketX = TicketX;
  readonly Loader2 = Loader2;

  tickets: TicketWithEvent[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.authService.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    await this.loadTickets();
  }

  async loadTickets() {
    try {
      // Por enquanto, vamos usar dados mockados já que não temos compras reais ainda
      // Quando integrar com Firebase, descomentar o código abaixo:
      
      /*
      const userEmail = this.authService.currentUser?.email;
      if (userEmail) {
        const allTickets = await this.firebaseService.getTicketsByEmail(userEmail);
        // Buscar dados dos eventos para cada ticket
        this.tickets = await Promise.all(
          allTickets.map(async (ticket) => {
            const event = await this.firebaseService.getEventById(ticket.eventId);
            return {
              ...ticket,
              eventTitle: event?.title || 'Evento',
              eventDate: event?.date || new Date(),
              eventLocation: event?.location || 'Local',
              eventImage: event?.imageUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'
            };
          })
        );
      }
      */

      // Dados mockados para demonstração
      this.tickets = this.getMockTickets();
      
    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
      this.tickets = [];
    } finally {
      this.loading = false;
    }
  }

  getMockTickets(): TicketWithEvent[] {
    const userEmail = this.authService.currentUser?.email || '';
    const userName = this.authService.currentUser?.displayName || 'Usuário';

    return [
      {
        id: '1',
        eventId: '1',
        eventTitle: 'Festival Eletrônica 2026',
        eventDate: new Date('2026-05-15'),
        eventLocation: 'São Paulo - SP',
        eventImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        buyerName: userName,
        buyerEmail: userEmail,
        quantity: 2,
        totalPrice: 240.00,
        purchaseDate: new Date('2026-04-01')
      },
      {
        id: '2',
        eventId: '2',
        eventTitle: 'Rock in Concert',
        eventDate: new Date('2026-05-22'),
        eventLocation: 'Rio de Janeiro - RJ',
        eventImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
        buyerName: userName,
        buyerEmail: userEmail,
        quantity: 1,
        totalPrice: 80.00,
        purchaseDate: new Date('2026-03-28')
      }
    ];
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getStatusClass(eventDate: Date): string {
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'bg-gray-400 text-gray-900';
    } else if (diffDays <= 7) {
      return 'bg-red-400 text-red-900';
    } else if (diffDays <= 30) {
      return 'bg-yellow-400 text-yellow-900';
    } else {
      return 'bg-green-400 text-green-900';
    }
  }

  getStatusText(eventDate: Date): string {
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Realizado';
    } else if (diffDays === 0) {
      return 'Hoje!';
    } else if (diffDays <= 7) {
      return `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays <= 30) {
      return 'Próximo';
    } else {
      return 'Confirmado';
    }
  }

  getTotalTickets(): number {
    return this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  }

  getTotalSpent(): number {
    return this.tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
