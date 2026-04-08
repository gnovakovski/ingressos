import { Component } from '@angular/core';
import { LucideAngularModule, Calendar, MapPin, Music, Guitar, PartyPopper, Laugh, Laptop, Users } from 'lucide-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Music = Music;
  readonly Guitar = Guitar;
  readonly PartyPopper = PartyPopper;
}
