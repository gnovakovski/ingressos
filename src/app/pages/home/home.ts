import { Component } from '@angular/core';
import { CarouselComponent } from '../../components/carousel/carousel';
import { HeroComponent } from '../../components/hero/hero';
import { EventsComponent } from '../../components/events/events';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselComponent, HeroComponent, EventsComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {}
