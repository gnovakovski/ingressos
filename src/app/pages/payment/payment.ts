import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, CreditCard, ShoppingCart, CheckCircle, Loader2, Lock, Calendar, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

interface TicketPerson {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  name: string;
  cpf: string;
  birthDate: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit {
  readonly CreditCard = CreditCard;
  readonly ShoppingCart = ShoppingCart;
  readonly CheckCircle = CheckCircle;
  readonly Loader2 = Loader2;
  readonly Lock = Lock;
  readonly Calendar = Calendar;
  readonly UserIcon = UserIcon;
  readonly AlertCircle = AlertCircle;
  readonly ArrowLeft = ArrowLeft;

  selectedTickets: TicketPerson[] = [];
  eventId: string = '';
  eventTitle: string = '';
  totalPrice: number = 0;
  processing: boolean = false;
  paymentSuccess: boolean = false;
  error: string = '';

  // Dados do cartão (para UI apenas - não processar de verdade ainda)
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const ticketsData = sessionStorage.getItem('selectedTickets');
    const eventTitle = sessionStorage.getItem('eventTitle');
    const eventId = sessionStorage.getItem('eventId');

    if (!ticketsData || !this.authService.currentUser) {
      this.router.navigate(['/']);
      return;
    }

    this.selectedTickets = JSON.parse(ticketsData);
    this.eventTitle = eventTitle || 'Evento';
    this.eventId = eventId || '';
    this.totalPrice = this.selectedTickets.reduce((sum, t) => sum + t.price, 0);
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardNumber = formattedValue.substring(0, 19); // 16 dígitos + 3 espaços
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardExpiry = value;
  }

  formatCvv(event: any) {
    this.cardCvv = event.target.value.replace(/\D/g, '').substring(0, 4);
  }

  goBack() {
    this.router.navigate(['/evento', this.eventId, 'ingressos']);
  }

  validatePaymentForm(): boolean {
    this.error = '';

    // Validações básicas (remover quando integrar API real)
    if (!this.cardNumber || this.cardNumber.replace(/\s/g, '').length < 16) {
      this.error = 'Número do cartão inválido';
      return false;
    }

    if (!this.cardName || this.cardName.trim().length < 3) {
      this.error = 'Nome do titular inválido';
      return false;
    }

    if (!this.cardExpiry || this.cardExpiry.length < 5) {
      this.error = 'Data de validade inválida';
      return false;
    }

    if (!this.cardCvv || this.cardCvv.length < 3) {
      this.error = 'CVV inválido';
      return false;
    }

    return true;
  }

  async processPayment() {
    if (!this.validatePaymentForm()) {
      return;
    }

    this.processing = true;
    this.error = '';

    try {
      // Simular processamento de pagamento (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aqui você integrará a API de pagamento no futuro
      // const paymentResult = await paymentGateway.process({...});

      // Salvar compra no Firestore
      await this.savePurchaseToFirestore();

      this.paymentSuccess = true;
      
      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        // Limpar dados da sessão
        sessionStorage.removeItem('selectedTickets');
        sessionStorage.removeItem('eventId');
        sessionStorage.removeItem('eventTitle');
        
        this.router.navigate(['/meus-ingressos']);
      }, 2000);

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      this.error = 'Erro ao processar pagamento. Tente novamente.';
      this.processing = false;
    }
  }

  async savePurchaseToFirestore() {
    const user = this.authService.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const purchaseData = {
      userId: user.uid,
      buyerName: user.displayName || 'Usuário',
      buyerEmail: user.email,
      eventId: this.eventId,
      eventTitle: this.eventTitle,
      tickets: this.selectedTickets.map(ticket => ({
        ticketTypeId: ticket.ticketTypeId,
        ticketTypeName: ticket.ticketTypeName,
        price: ticket.price,
        participantName: ticket.name,
        participantCpf: ticket.cpf,
        participantBirthDate: ticket.birthDate
      })),
      quantity: this.selectedTickets.length,
      totalPrice: this.totalPrice,
      purchaseDate: Timestamp.now(),
      paymentStatus: 'completed',
      paymentMethod: 'credit_card' // Será atualizado quando integrar API real
    };

    await addDoc(collection(db, 'purchases'), purchaseData);
  }
}
