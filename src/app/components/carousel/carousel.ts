import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from 'lucide-angular';

interface CarouselEvent {
  id: number;
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

  currentSlide = 0;
  autoPlayInterval: any;

  featuredEvents: CarouselEvent[] = [
    {
      id: 1,
      title: 'Festival Eletrônica 2026',
      subtitle: 'O maior festival de música eletrônica do Brasil',
      date: '15 de Maio, 2026',
      location: 'Allianz Parque - São Paulo',
      price: 'A partir de R$ 120,00',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80',
      category: 'Festival'
    },
    {
      id: 2,
      title: 'Rock in Concert',
      subtitle: 'Uma noite épica com as melhores bandas de rock',
      date: '22 de Maio, 2026',
      location: 'Maracanã - Rio de Janeiro',
      price: 'A partir de R$ 80,00',
      imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1600&q=80',
      category: 'Show'
    },
    {
      id: 3,
      title: 'Tech Summit Brasil 2026',
      subtitle: 'O futuro da tecnologia acontece aqui',
      date: '10 de Junho, 2026',
      location: 'Expo Center Norte - São Paulo',
      price: 'A partir de R$ 200,00',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
      category: 'Conferência'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
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
    this.currentSlide = (this.currentSlide + 1) % this.featuredEvents.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.featuredEvents.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
