import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets';
import { EventDetailsComponent } from './pages/event-details/event-details';
import { TicketSelectionComponent } from './pages/ticket-selection/ticket-selection';
import { PaymentComponent } from './pages/payment/payment';
import { ValidateVoucherComponent } from './pages/validate-voucher/validate-voucher';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'meus-ingressos',
    component: MyTicketsComponent
  },
  {
    path: 'evento/:id',
    component: EventDetailsComponent
  },
  {
    path: 'evento/:id/ingressos',
    component: TicketSelectionComponent
  },
  {
    path: 'pagamento',
    component: PaymentComponent
  },
  {
    path: 'validar-voucher',
    component: ValidateVoucherComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
