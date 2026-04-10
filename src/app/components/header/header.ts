import { Component, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, User, LogOut, Ticket, Search, X, Menu } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Ticket = Ticket;
  readonly Search = Search;
  readonly X = X;
  readonly Menu = Menu;
  
  isLoggedIn = false;
  userName = '';
  searchQuery = '';
  menuOpen = false;
  private authSubscription?: Subscription;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Inscrever-se nas mudanças de autenticação
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.userName = user.displayName || 'Usuário';
      } else {
        this.isLoggedIn = false;
        this.userName = '';
      }
    });
  }

  ngOnDestroy() {
    // Cancelar inscrição ao destruir o componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onSearch() {
    // TODO: Implementar lógica de busca
    // Por enquanto, apenas loga no console
    if (this.searchQuery.trim()) {
      console.log('Buscando por:', this.searchQuery);
      // Futuramente, você pode:
      // 1. Navegar para uma página de resultados
      // 2. Filtrar eventos na página atual
      // 3. Fazer uma busca no Firebase
    }
  }

  clearSearch() {
    this.searchQuery = '';
    // TODO: Limpar resultados de busca se houver
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToMyTickets() {
    this.router.navigate(['/meus-ingressos']);
  }

  async logout() {
    try {
      await this.authService.logout();
      // Recarregar a página para limpar todo o estado (apenas no browser)
      if (isPlatformBrowser(this.platformId)) {
        window.location.href = '/';
      } else {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
