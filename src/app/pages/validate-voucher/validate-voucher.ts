import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Scan, CheckCircle, XCircle, AlertCircle, User, Ticket, Calendar, DollarSign } from 'lucide-angular';
import { ValidationService, ValidationResult } from '../../services/validation.service';

@Component({
  selector: 'app-validate-voucher',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './validate-voucher.html',
  styleUrl: './validate-voucher.css'
})
export class ValidateVoucherComponent {
  readonly Scan = Scan;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly AlertCircle = AlertCircle;
  readonly User = User;
  readonly Ticket = Ticket;
  readonly Calendar = Calendar;
  readonly DollarSign = DollarSign;

  code: string = '';
  validating: boolean = false;
  result: ValidationResult | null = null;

  constructor(private validationService: ValidationService) {}

  async validateCode() {
    if (!this.code.trim()) {
      return;
    }

    this.validating = true;
    this.result = null;

    try {
      this.result = await this.validationService.validateVoucher(this.code.trim());
    } catch (error) {
      console.error('Erro ao validar:', error);
      this.result = {
        valid: false,
        message: 'Erro ao validar voucher'
      };
    } finally {
      this.validating = false;
    }
  }

  async checkStatus() {
    if (!this.code.trim()) {
      return;
    }

    this.validating = true;
    this.result = null;

    try {
      this.result = await this.validationService.checkVoucherStatus(this.code.trim());
    } catch (error) {
      console.error('Erro ao verificar:', error);
      this.result = {
        valid: false,
        message: 'Erro ao verificar status'
      };
    } finally {
      this.validating = false;
    }
  }

  reset() {
    this.code = '';
    this.result = null;
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatPrice(price?: number): string {
    if (!price) return '';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }
}
