import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly LogIn = LogIn;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.error = '';
    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      
      // Verificar se há uma URL de redirecionamento salva
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      
      if (redirectUrl) {
        // Limpar a URL salva
        sessionStorage.removeItem('redirectUrl');
        // Redirecionar para a URL original
        this.router.navigateByUrl(redirectUrl);
      } else {
        // Redirecionar para home se não houver URL salva
        this.router.navigate(['/']);
      }
      
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.error = 'Email ou senha incorretos';
      } else if (error.code === 'auth/invalid-email') {
        this.error = 'Email inválido';
      } else if (error.code === 'auth/user-disabled') {
        this.error = 'Conta desativada';
      } else {
        this.error = 'Erro ao fazer login. Tente novamente.';
      }
      this.loading = false;
    }
  }

  goToRegister() {
    // Manter a URL de redirecionamento ao ir para o cadastro
    this.router.navigate(['/register']);
  }
}
