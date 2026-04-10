import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, User, Mail, MapPin, UserPlus, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  readonly User = User;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly UserPlus = UserPlus;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;

  formData = {
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    dataNascimento: '',
    password: '',
    confirmPassword: '',
    endereco: {
      rua: '',
      numero: '',
      complemento: '',
      cidade: '',
      estado: ''
    }
  };

  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  success = false;
  error = '';

  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  formatCpf(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.formData.cpf = value;
  }

  validateForm(): string | null {
    // Validar nome e sobrenome
    if (!this.formData.nome.trim() || !this.formData.sobrenome.trim()) {
      return 'Nome e sobrenome são obrigatórios';
    }

    // Validar CPF
    const cpfClean = this.formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return 'CPF inválido';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      return 'Email inválido';
    }

    // Validar data de nascimento
    if (!this.formData.dataNascimento) {
      return 'Data de nascimento é obrigatória';
    }

    const birthDate = new Date(this.formData.dataNascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      return 'Você deve ter pelo menos 18 anos';
    }

    // Validar senha
    if (this.formData.password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      return 'As senhas não coincidem';
    }

    // Validar endereço
    if (!this.formData.endereco.rua.trim() || 
        !this.formData.endereco.numero.trim() || 
        !this.formData.endereco.cidade.trim() || 
        !this.formData.endereco.estado) {
      return 'Preencha todos os campos obrigatórios do endereço';
    }

    return null;
  }

  async onSubmit() {
    this.error = '';
    this.success = false;

    // Validar formulário
    const validationError = this.validateForm();
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;

    try {
      await this.authService.register(
        {
          nome: this.formData.nome.trim(),
          sobrenome: this.formData.sobrenome.trim(),
          cpf: this.formData.cpf.replace(/\D/g, ''),
          email: this.formData.email.trim().toLowerCase(),
          dataNascimento: new Date(this.formData.dataNascimento),
          endereco: {
            rua: this.formData.endereco.rua.trim(),
            numero: this.formData.endereco.numero.trim(),
            complemento: this.formData.endereco.complemento?.trim(),
            cidade: this.formData.endereco.cidade.trim(),
            estado: this.formData.endereco.estado
          }
        },
        this.formData.password
      );

      this.success = true;
      
      // Verificar se há uma URL de redirecionamento salva (apenas no browser)
      let redirectUrl: string | null = null;
      if (isPlatformBrowser(this.platformId)) {
        redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectUrl');
        }
      }
      
      if (redirectUrl) {
        // Redirecionar para a URL original após 1.5s
        setTimeout(() => {
          this.router.navigateByUrl(redirectUrl);
        }, 1500);
      } else {
        // Redirecionar para home se não houver URL salva
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      
      if (error.message) {
        this.error = error.message;
      } else if (error.code === 'auth/email-already-in-use') {
        this.error = 'Este email já está cadastrado';
      } else if (error.code === 'auth/weak-password') {
        this.error = 'A senha é muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        this.error = 'Email inválido';
      } else {
        this.error = 'Erro ao criar conta. Tente novamente.';
      }
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    // Manter a URL de redirecionamento ao ir para o login
    this.router.navigate(['/login']);
  }
}
