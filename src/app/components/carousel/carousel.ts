import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-angular';
import { EventService, Event as FirebaseEvent } from '../../services/event.service';

interface CarouselEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  price: string;
  imageUrl: string;
  category: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly ArrowRight = ArrowRight;
  readonly Loader2 = Loader2;

  currentSlide = 0;
  autoPlayInterval: any;
  featuredEvents: CarouselEvent[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    await this.loadFeaturedEvents();
    if (this.featuredEvents.length > 0) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  async loadFeaturedEvents() {
    try {
      console.log('🎯 CarouselComponent: Iniciando carregamento');
      const events = await this.eventService.getFeaturedEvents();
      
      console.log('🎯 CarouselComponent: Eventos recebidos:', events.length);
      
      this.ngZone.run(() => {
        this.featuredEvents = events.map(event => ({
          id: event.id,
          title: event.title,
          subtitle: event.shortDescription,
          date: this.formatDate(event.date),
          location: `${event.venue} - ${event.city}`,
          price: this.getMinPrice(event),
          imageUrl: event.image,
          category: event.category
        }));
        
        console.log('🎯 CarouselComponent: Featured events processados:', this.featuredEvents.length);
        console.log('🎯 CarouselComponent: Primeiro evento:', this.featuredEvents[0]?.title);
        
        this.loading = false;
        
        console.log('🎯 CarouselComponent: Loading =', this.loading);
      });
      
    } catch (error) {
      console.error('❌ CarouselComponent: Erro ao carregar eventos em destaque:', error);
      this.ngZone.run(() => {
        this.loading = false;
      });
    }
  }

  formatDate(date: Date): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  getMinPrice(event: FirebaseEvent): string {
    if (event.ticketTypes.length === 0) return 'Consultar valores';
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `A partir de R$ ${minPrice.toFixed(2).replace('.', ',')}`;
  }

  navigateToEvent(eventId: string) {
    this.router.navigate(['/evento', eventId]);
  }

  startAutoPlay() {
    if (this.featuredEvents.length <= 1) return;
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    if (this.featuredEvents.length === 0) return;
    this.currentSlide = (this.currentSlide + 1) % this.featuredEvents.length;
  }

  prevSlide() {
    if (this.featuredEvents.length === 0) return;
    this.currentSlide = this.currentSlide === 0 ? this.featuredEvents.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
