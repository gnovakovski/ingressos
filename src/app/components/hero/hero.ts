import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Music, Guitar, PartyPopper, Loader2 } from 'lucide-angular';
import { EventService, Event as FirebaseEvent } from '../../services/event.service';

interface HeroEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  status: string;
  statusColor: string;
  imageUrl: string;
  icon: any;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Music = Music;
  readonly Guitar = Guitar;
  readonly PartyPopper = PartyPopper;
  readonly Loader2 = Loader2;

  events: HeroEvent[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadEvents();
  }

  async loadEvents() {
    try {
      console.log('🎯 HeroComponent: Iniciando carregamento');
      const allEvents = await this.eventService.getAllEvents();
      
      console.log('🎯 HeroComponent: Eventos recebidos:', allEvents.length);
      
      // Pegar os 3 primeiros eventos
      this.events = allEvents.slice(0, 3).map(event => ({
        id: event.id,
        title: event.title,
        date: this.formatShortDate(event.date),
        location: event.city,
        price: this.getMinPrice(event),
        status: this.getStatus(event),
        statusColor: this.getStatusColor(event),
        imageUrl: event.image,
        icon: this.getCategoryIcon(event.category)
      }));
      
      console.log('🎯 HeroComponent: Hero events processados:', this.events.length);
      
      this.loading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      
      console.log('🎯 HeroComponent: Loading =', this.loading);
      
    } catch (error) {
      console.error('❌ HeroComponent: Erro ao carregar eventos:', error);
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatShortDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  getMinPrice(event: FirebaseEvent): string {
    if (event.ticketTypes.length === 0) return 'Consultar';
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `A partir de R$ ${minPrice.toFixed(0)}`;
  }

  getStatus(event: FirebaseEvent): string {
    const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.available, 0);
    if (totalAvailable > 100) return 'Disponível';
    if (totalAvailable > 0) return 'Últimos';
    return 'Esgotado';
  }

  getStatusColor(event: FirebaseEvent): string {
    const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.available, 0);
    if (totalAvailable > 100) return 'bg-green-400 text-green-900';
    if (totalAvailable > 0) return 'bg-yellow-400 text-yellow-900';
    return 'bg-red-400 text-red-900';
  }

  getCategoryIcon(category: string): any {
    const icons: { [key: string]: any } = {
      'Festival': Music,
      'Show': Guitar,
      'Festa': PartyPopper,
      'Música': Music
    };
    return icons[category] || Music;
  }

  navigateToEvent(eventId: string) {
    this.router.navigate(['/evento', eventId]);
  }
}
