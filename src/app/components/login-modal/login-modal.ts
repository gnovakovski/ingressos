import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, X, LogIn, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModalComponent {
  readonly X = X;
  readonly LogIn = LogIn;
  readonly UserPlus = UserPlus;

  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  onClose() {
    this.close.emit();
  }

  goToLogin() {
    this.close.emit();
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.close.emit();
    this.router.navigate(['/register']);
  }
}
