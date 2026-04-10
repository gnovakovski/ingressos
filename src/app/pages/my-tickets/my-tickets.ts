import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideAngularModule, Calendar, MapPin, User, Ticket, Download, Loader2 } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { VoucherService, Voucher } from '../../services/voucher.service';
import jsPDF from 'jspdf';

interface EventGroup {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  vouchers: Voucher[];
}

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css'
})
export class MyTicketsComponent implements OnInit, OnDestroy {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly User = User;
  readonly Ticket = Ticket;
  readonly Download = Download;
  readonly Loader2 = Loader2;

  eventGroups: EventGroup[] = [];
  loading = true;
  totalTickets = 0;
  totalSpent = 0;
  isCheckingAuth = true;
  isLoggedIn = false;
  private authSubscription?: Subscription;
  private isLoadingVouchers = false;

  constructor(
    private authService: AuthService,
    private voucherService: VoucherService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🎫 MyTicketsComponent: ngOnInit chamado');
    
    // Prevenir múltiplas inicializações
    if (this.isLoadingVouchers) {
      console.log('⏳ MyTickets: Já está carregando, ignorando chamada duplicada');
      return;
    }

    this.isLoadingVouchers = true;
    
    // Aguardar um pouco para garantir que o AuthService inicializou
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Inscrever-se nas mudanças de autenticação (igual ao header)
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('🔐 MyTickets: Auth state changed:', user ? user.email : 'não autenticado');
      
      this.isCheckingAuth = false;
      
      if (user) {
        this.isLoggedIn = true;
        console.log('✅ MyTickets: Usuário autenticado, carregando vouchers');
        this.loadVouchers();
      } else {
        this.isLoggedIn = false;
        console.log('❌ MyTickets: Usuário não autenticado, redirecionando');
        this.router.navigate(['/login']);
      }
      
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async loadVouchers() {
    // Prevenir múltiplas chamadas simultâneas
    if (this.loading) {
      console.log('⏳ MyTickets: Já está carregando vouchers, ignorando chamada duplicada');
      return;
    }

    this.loading = true;
    
    console.log('═══════════════════════════════════════');
    console.log('🎫 MyTickets.loadVouchers INICIADO');
    console.log('═══════════════════════════════════════');
    
    try {
      const user = this.authService.currentUser;
      
      if (!user) {
        console.log('❌ ERRO: Usuário não encontrado');
        this.ngZone.run(() => {
          this.loading = false;
        });
        return;
      }

      console.log('✅ Usuário encontrado:');
      console.log('   - UID:', user.uid);
      console.log('   - Email:', user.email);
      console.log('   - DisplayName:', user.displayName);
      
      console.log('');
      console.log('🔄 Chamando VoucherService.getUserVouchers...');
      console.log('───────────────────────────────────────');
      
      const vouchers = await this.voucherService.getUserVouchers(user.uid);
      
      console.log('───────────────────────────────────────');
      console.log('✅ VoucherService retornou:', vouchers.length, 'vouchers');
      
      if (vouchers.length === 0) {
        console.log('⚠️ Nenhum voucher encontrado');
        console.log('💡 Possíveis causas:');
        console.log('   1. Usuário ainda não comprou ingressos');
        console.log('   2. userId no banco não corresponde ao UID do usuário');
        console.log('   3. Coleção vouchers está vazia');
        
        this.ngZone.run(() => {
          this.eventGroups = [];
          this.totalTickets = 0;
          this.totalSpent = 0;
          this.loading = false;
          this.cdr.detectChanges();
        });
        return;
      }
      
      console.log('');
      console.log('📊 Agrupando vouchers por evento...');
      const groupsMap = new Map<string, EventGroup>();
      
      vouchers.forEach((voucher, index) => {
        console.log(`   ${index + 1}. ${voucher.code} - ${voucher.eventTitle}`);
        
        if (!groupsMap.has(voucher.eventId)) {
          groupsMap.set(voucher.eventId, {
            eventId: voucher.eventId,
            eventTitle: voucher.eventTitle,
            eventDate: voucher.eventDate,
            eventLocation: voucher.eventLocation,
            vouchers: []
          });
        }
        groupsMap.get(voucher.eventId)!.vouchers.push(voucher);
      });

      const groups = Array.from(groupsMap.values())
        .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
      
      console.log('');
      console.log('✅ Agrupamento concluído:');
      groups.forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.eventTitle}: ${group.vouchers.length} ingresso(s)`);
      });

      this.ngZone.run(() => {
        this.eventGroups = groups;
        this.totalTickets = this.calculateTotalTickets(groups);
        this.totalSpent = this.calculateTotalSpent(groups);
        this.loading = false;
        
        console.log('');
        console.log('✅ Estado atualizado no Angular');
        console.log('   - eventGroups.length:', this.eventGroups.length);
        console.log('   - totalTickets:', this.totalTickets);
        console.log('   - totalSpent:', this.totalSpent);
        console.log('   - loading:', this.loading);
        
        // Forçar detecção de mudanças
        this.cdr.detectChanges();
        console.log('✅ ChangeDetectorRef.detectChanges() chamado');
      });
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('🎉 MyTickets.loadVouchers CONCLUÍDO');
      console.log('═══════════════════════════════════════');
      
    } catch (error) {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.error('❌ ERRO em loadVouchers');
      console.log('═══════════════════════════════════════');
      console.error('Tipo:', typeof error);
      console.error('Mensagem:', (error as Error).message);
      console.error('Stack:', (error as Error).stack);
      
      this.ngZone.run(() => {
        this.loading = false;
        this.eventGroups = [];
        this.totalTickets = 0;
        this.totalSpent = 0;
        this.cdr.detectChanges();
      });
    }
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  formatDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private calculateTotalTickets(groups: EventGroup[]): number {
    return groups.reduce((sum, group) => sum + group.vouchers.length, 0);
  }

  private calculateTotalSpent(groups: EventGroup[]): number {
    return groups.reduce((sum, group) => 
      sum + group.vouchers.reduce((vSum, v) => vSum + v.price, 0), 0
    );
  }

  getStatusClass(eventDate: Date): string {
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'bg-gray-400 text-gray-900';
    } else if (diffDays <= 7) {
      return 'bg-red-400 text-red-900';
    } else if (diffDays <= 30) {
      return 'bg-yellow-400 text-yellow-900';
    } else {
      return 'bg-green-400 text-green-900';
    }
  }

  getStatusText(eventDate: Date): string {
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Realizado';
    } else if (diffDays === 0) {
      return 'Hoje!';
    } else if (diffDays <= 7) {
      return `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays <= 30) {
      return 'Próximo';
    } else {
      return 'Confirmado';
    }
  }

  getTotalTickets(): number {
    return this.totalTickets;
  }

  getTotalSpent(): number {
    return this.totalSpent;
  }

  async downloadVoucher(voucher: Voucher) {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Fundo branco
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F');

      // Box principal do voucher (compacto no topo)
      const voucherHeight = 140;
      const margin = 15;
      const voucherWidth = 180;

      // Fundo azul claro do voucher
      pdf.setFillColor(173, 216, 230);
      pdf.rect(margin, margin, voucherWidth, voucherHeight, 'F');

      // Título do evento
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(voucher.eventTitle, margin + 5, margin + 12);

      // Ícone e data
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${this.formatDateTime(voucher.eventDate)}`, margin + 5, margin + 22);

      // Ícone e local
      pdf.text(`Local: ${voucher.eventLocation}`, margin + 5, margin + 28);
      pdf.setFontSize(8);
      pdf.text(voucher.eventAddress, margin + 5, margin + 33);

      // Box do ingresso (cinza claro)
      const ingressoY = margin + 40;
      pdf.setFillColor(220, 220, 220);
      pdf.rect(margin + 3, ingressoY, 115, 30, 'F');

      // Box branco interno
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin + 5, ingressoY + 2, 111, 26, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('INGRESSO', margin + 8, ingressoY + 7);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${voucher.ticketBatch} - ${voucher.ticketType}`, margin + 8, ingressoY + 14);

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`R$ ${voucher.price.toFixed(2).replace('.', ',')}`, margin + 8, ingressoY + 22);

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Comprado dia ${this.formatDateTime(voucher.purchaseDate)}`, margin + 8, ingressoY + 26);

      // Box do QR Code (lado direito)
      const qrBoxX = margin + 120;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(qrBoxX, ingressoY, 57, 60, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(qrBoxX, ingressoY, 57, 60, 'S');

      if (voucher.qrCodeDataUrl) {
        pdf.addImage(voucher.qrCodeDataUrl, 'PNG', qrBoxX + 3, ingressoY + 3, 51, 51);
      }

      // Box do participante
      const participanteY = ingressoY + 35;
      pdf.setFillColor(220, 220, 220);
      pdf.rect(margin + 3, participanteY, 115, 25, 'F');

      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin + 5, participanteY + 2, 111, 21, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Participante', margin + 8, participanteY + 7);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(voucher.participantName, margin + 8, participanteY + 14);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`CPF: ${voucher.participantCpf}`, margin + 8, participanteY + 19);

      // Box do código de barras
      const barcodeY = margin + 105;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin + 3, barcodeY, voucherWidth - 6, 30, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin + 3, barcodeY, voucherWidth - 6, 30, 'S');

      if (voucher.barcodeDataUrl) {
        pdf.addImage(voucher.barcodeDataUrl, 'PNG', margin + 10, barcodeY + 5, 160, 20);
      }

      // Rodapé do voucher
      const footerY = margin + voucherHeight + 10;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Este voucher e valido para entrada no evento.', 105, footerY, { align: 'center' });
      pdf.text('Apresente-o na portaria junto com documento de identidade.', 105, footerY + 5, { align: 'center' });

      // Salvar PDF
      pdf.save(`ingresso-${voucher.code}.pdf`);
      
      console.log('✅ PDF gerado com sucesso:', `ingresso-${voucher.code}.pdf`);
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar voucher. Tente novamente.');
    }
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
