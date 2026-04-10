import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Music, Guitar, PartyPopper, Laugh, Laptop, Users, ShoppingCart, Loader2 } from 'lucide-angular';
import { EventService, Event as FirebaseEvent } from '../../services/event.service';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  gradient: string;
  icon: any;
  imageUrl: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class EventsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly ShoppingCart = ShoppingCart;
  readonly Loader2 = Loader2;
  
  events: Event[] = [];
  loading = true;
  private isLoading = false;
  
  constructor(
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadEvents();
  }

  async loadEvents() {
    // Prevenir múltiplas chamadas simultâneas
    if (this.isLoading) {
      console.log('⏳ EventsComponent: Já está carregando, ignorando chamada duplicada');
      return;
    }

    this.isLoading = true;
    this.loading = true;

    try {
      console.log('🎯 EventsComponent: Iniciando carregamento');
      const firebaseEvents = await this.eventService.getAllEvents();
      
      console.log('🎯 EventsComponent: Eventos recebidos:', firebaseEvents.length);
      
      this.events = firebaseEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: this.formatDate(event.date),
        location: `${event.city} - ${event.state}`,
        price: this.getMinPrice(event),
        category: event.category,
        gradient: this.getCategoryGradient(event.category),
        icon: this.getCategoryIcon(event.category),
        imageUrl: event.image
      }));
      
      console.log('🎯 EventsComponent: Events processados:', this.events.length);
      
      this.loading = false;
      this.isLoading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      
      console.log('🎯 EventsComponent: Loading =', this.loading);
      
    } catch (error) {
      console.error('❌ EventsComponent: Erro ao carregar eventos:', error);
      this.loading = false;
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getMinPrice(event: FirebaseEvent): string {
    if (event.ticketTypes.length === 0) return 'Consultar';
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `R$ ${minPrice.toFixed(2).replace('.', ',')}`;
  }

  getCategoryGradient(category: string): string {
    const gradients: { [key: string]: string } = {
      'Festival': 'from-purple-600 to-pink-500',
      'Show': 'from-red-500 to-orange-500',
      'Festa': 'from-cyan-500 to-blue-500',
      'Entretenimento': 'from-yellow-500 to-red-500',
      'Tecnologia': 'from-indigo-600 to-purple-600',
      'Música': 'from-green-500 to-teal-500'
    };
    return gradients[category] || 'from-gray-600 to-gray-800';
  }

  getCategoryIcon(category: string): any {
    const icons: { [key: string]: any } = {
      'Festival': Music,
      'Show': Guitar,
      'Festa': PartyPopper,
      'Entretenimento': Laugh,
      'Tecnologia': Laptop,
      'Música': Users
    };
    return icons[category] || Music;
  }

  navigateToEvent(eventId: string) {
    this.router.navigate(['/evento', eventId]);
  }
}
