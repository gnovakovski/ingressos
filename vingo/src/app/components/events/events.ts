import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Music, Guitar, PartyPopper, Laugh, Laptop, Users, ShoppingCart } from 'lucide-angular';

interface Event {
  id: number;
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
export class EventsComponent {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly ShoppingCart = ShoppingCart;
  
  constructor(private router: Router) {}

  navigateToEvent(eventId: number) {
    this.router.navigate(['/evento', eventId]);
  }
  
  events: Event[] = [
    {
      id: 1,
      title: 'Festival Eletrônica 2026',
      date: '15 Mai 2026',
      location: 'São Paulo - SP',
      price: 'R$ 120,00',
      category: 'Música',
      gradient: 'from-purple-600 to-pink-500',
      icon: Music,
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'
    },
    {
      id: 2,
      title: 'Rock in Concert',
      date: '22 Mai 2026',
      location: 'Rio de Janeiro - RJ',
      price: 'R$ 80,00',
      category: 'Show',
      gradient: 'from-red-500 to-orange-500',
      icon: Guitar,
      imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80'
    },
    {
      id: 3,
      title: 'Festa Neon Night',
      date: '28 Mai 2026',
      location: 'Belo Horizonte - MG',
      price: 'R$ 50,00',
      category: 'Festa',
      gradient: 'from-cyan-500 to-blue-500',
      icon: PartyPopper,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
    },
    {
      id: 4,
      title: 'Stand-up Comedy Show',
      date: '05 Jun 2026',
      location: 'Curitiba - PR',
      price: 'R$ 60,00',
      category: 'Entretenimento',
      gradient: 'from-yellow-500 to-red-500',
      icon: Laugh,
      imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80'
    },
    {
      id: 5,
      title: 'Tech Summit Brasil',
      date: '10 Jun 2026',
      location: 'São Paulo - SP',
      price: 'R$ 200,00',
      category: 'Tecnologia',
      gradient: 'from-indigo-600 to-purple-600',
      icon: Laptop,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
    },
    {
      id: 6,
      title: 'Sertanejo Universitário',
      date: '18 Jun 2026',
      location: 'Goiânia - GO',
      price: 'R$ 90,00',
      category: 'Show',
      gradient: 'from-green-500 to-teal-500',
      icon: Users,
      imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80'
    }
  ];
}
