import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-ticket-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-purchase.html',
  styleUrl: './ticket-purchase.css'
})
export class TicketPurchaseComponent {
  @Input() eventId!: string;
  @Input() eventTitle!: string;
  @Input() eventPrice!: number;
  @Input() availableTickets!: number;

  buyerName = '';
  buyerEmail = '';
  quantity = 1;
  loading = false;
  success = false;
  error = '';

  constructor(private firebaseService: FirebaseService) {}

  get totalPrice(): number {
    return this.eventPrice * this.quantity;
  }

  async purchaseTicket() {
    if (!this.buyerName || !this.buyerEmail || this.quantity < 1) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    if (this.quantity > this.availableTickets) {
      this.error = 'Quantidade indisponível';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.firebaseService.purchaseTicket({
        eventId: this.eventId,
        buyerName: this.buyerName,
        buyerEmail: this.buyerEmail,
        quantity: this.quantity,
        totalPrice: this.totalPrice,
        purchaseDate: new Date()
      });

      this.success = true;
      this.resetForm();
    } catch (error) {
      console.error('Erro ao comprar ingresso:', error);
      this.error = 'Erro ao processar compra. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }

  private resetForm() {
    this.buyerName = '';
    this.buyerEmail = '';
    this.quantity = 1;
  }
}
