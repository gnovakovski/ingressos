import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock, Info, Ticket, Shield, RefreshCw, Loader2 } from 'lucide-angular';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted?: string;
  available: number;
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
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Event ID:', this.eventId);
    this.loadEvent();
  }

  loadEvent() {
    this.loading = true;
    
    // Mock data - substituir por chamada ao Firebase
    setTimeout(() => {
      const rawEvent = this.getMockEvent(this.eventId);
      
      // Pré-processar TODOS os dados para evitar qualquer chamada de função no template
      const processedTicketTypes: TicketType[] = rawEvent.ticketTypes.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        priceFormatted: ticket.price.toFixed(2),
        available: ticket.available
      }));
      
      const eventDate = rawEvent.date;
      const minPrice = Math.min(...rawEvent.ticketTypes.map(t => t.price));
      
      // Criar objeto completamente processado
      this.event = {
        id: rawEvent.id,
        title: rawEvent.title,
        description: rawEvent.description,
        date: eventDate,
        dateFormatted: this.formatDate(eventDate),
        timeFormatted: this.formatTime(eventDate),
        location: rawEvent.location,
        address: rawEvent.address,
        imageUrl: rawEvent.imageUrl,
        availableTickets: rawEvent.availableTickets,
        ticketTypes: processedTicketTypes,
        minPrice: minPrice.toFixed(2)
      };
      
      this.loading = false;
    }, 300);
  }

  calculateMinPrice(ticketTypes: TicketType[]): string {
    const minPrice = Math.min(...ticketTypes.map(t => t.price));
    return minPrice.toFixed(2);
  }

  getMockEvent(id: string): Event {
    // Dados mockados baseados no ID
    const events: { [key: string]: Event } = {
      '1': {
        id: '1',
        title: 'Festival Eletrônica 2026',
        description: 'O maior festival de música eletrônica do Brasil está de volta! Prepare-se para uma noite inesquecível com os melhores DJs nacionais e internacionais. Uma experiência única com estrutura de ponta, efeitos visuais incríveis e muito mais.',
        date: new Date('2026-05-15T20:00:00'),
        location: 'São Paulo - SP',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        availableTickets: 500,
        ticketTypes: [
          { id: '1', name: 'Pista', description: 'Acesso à área de pista', price: 120.00, available: 300 },
          { id: '2', name: 'Front Stage', description: 'Área próxima ao palco', price: 200.00, available: 150 },
          { id: '3', name: 'Camarote', description: 'Área VIP com open bar', price: 350.00, available: 50 }
        ]
      },
      '2': {
        id: '2',
        title: 'Rock in Concert',
        description: 'Uma noite épica de rock com as melhores bandas nacionais. Prepare-se para muito som, energia e diversão!',
        date: new Date('2026-05-22T21:00:00'),
        location: 'Rio de Janeiro - RJ',
        address: 'Av. Atlântica, 500 - Copacabana, Rio de Janeiro - RJ',
        imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
        availableTickets: 300,
        ticketTypes: [
          { id: '1', name: 'Pista', description: 'Acesso à área de pista', price: 80.00, available: 200 },
          { id: '2', name: 'Camarote', description: 'Área VIP', price: 150.00, available: 100 }
        ]
      },
      '3': {
        id: '3',
        title: 'Festa Neon Night',
        description: 'A festa mais colorida do ano! Venha brilhar com a gente em uma noite inesquecível de música e diversão.',
        date: new Date('2026-05-28T22:00:00'),
        location: 'Belo Horizonte - MG',
        address: 'Av. Afonso Pena, 1500 - Centro, Belo Horizonte - MG',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        availableTickets: 400,
        ticketTypes: [
          { id: '1', name: 'Pista', description: 'Acesso à área de pista', price: 50.00, available: 300 },
          { id: '2', name: 'VIP', description: 'Área VIP com bebidas', price: 100.00, available: 100 }
        ]
      },
      '4': {
        id: '4',
        title: 'Stand-up Comedy Show',
        description: 'Uma noite de muitas risadas com os melhores comediantes do Brasil. Diversão garantida!',
        date: new Date('2026-06-05T20:00:00'),
        location: 'Curitiba - PR',
        address: 'Rua XV de Novembro, 1000 - Centro, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
        availableTickets: 200,
        ticketTypes: [
          { id: '1', name: 'Plateia', description: 'Assentos na plateia', price: 60.00, available: 150 },
          { id: '2', name: 'Mesa VIP', description: 'Mesa com 4 lugares', price: 200.00, available: 50 }
        ]
      },
      '5': {
        id: '5',
        title: 'Tech Summit Brasil',
        description: 'O maior evento de tecnologia do Brasil. Palestras, workshops e networking com os maiores nomes do mercado.',
        date: new Date('2026-06-10T09:00:00'),
        location: 'São Paulo - SP',
        address: 'Av. Paulista, 2000 - Bela Vista, São Paulo - SP',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        availableTickets: 1000,
        ticketTypes: [
          { id: '1', name: 'Individual', description: 'Acesso completo ao evento', price: 200.00, available: 800 },
          { id: '2', name: 'Premium', description: 'Acesso VIP + workshops', price: 500.00, available: 200 }
        ]
      },
      '6': {
        id: '6',
        title: 'Sertanejo Universitário',
        description: 'A melhor festa sertaneja do ano! Grandes nomes da música sertaneja em um único lugar.',
        date: new Date('2026-06-18T20:00:00'),
        location: 'Goiânia - GO',
        address: 'Av. T-9, 1000 - Setor Bueno, Goiânia - GO',
        imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
        availableTickets: 600,
        ticketTypes: [
          { id: '1', name: 'Pista', description: 'Acesso à área de pista', price: 90.00, available: 400 },
          { id: '2', name: 'Camarote', description: 'Área VIP com open bar', price: 250.00, available: 200 }
        ]
      }
    };

    // Retorna o evento correspondente ou o primeiro como fallback
    return events[id] || events['1'];
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  goToTicketSelection() {
    this.router.navigate(['/evento', this.eventId, 'ingressos']);
  }
}
