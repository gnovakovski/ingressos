import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, CreditCard, ShoppingCart, CheckCircle, Loader2 } from 'lucide-angular';

interface TicketPerson {
  id: string;
  ticketTypeName: string;
  price: number;
  name: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit {
  readonly CreditCard = CreditCard;
  readonly ShoppingCart = ShoppingCart;
  readonly CheckCircle = CheckCircle;
  readonly Loader2 = Loader2;

  selectedTickets: TicketPerson[] = [];
  eventTitle: string = '';
  totalPrice: number = 0;
  processing: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const ticketsData = sessionStorage.getItem('selectedTickets');
    const eventTitle = sessionStorage.getItem('eventTitle');

    if (!ticketsData) {
      this.router.navigate(['/']);
      return;
    }

    this.selectedTickets = JSON.parse(ticketsData);
    this.eventTitle = eventTitle || 'Evento';
    this.totalPrice = this.selectedTickets.reduce((sum, t) => sum + t.price, 0);
  }

  processPayment() {
    this.processing = true;

    // Simular processamento de pagamento
    setTimeout(() => {
      this.processing = false;
      // Limpar dados da sessão
      sessionStorage.removeItem('selectedTickets');
      sessionStorage.removeItem('eventId');
      sessionStorage.removeItem('eventTitle');
      
      // Redirecionar para página de sucesso ou meus ingressos
      this.router.navigate(['/meus-ingressos']);
    }, 2000);
  }
}
