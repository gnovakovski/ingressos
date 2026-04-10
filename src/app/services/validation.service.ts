import { Injectable } from '@angular/core';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

export interface ValidationResult {
  valid: boolean;
  message: string;
  voucher?: {
    id: string;
    code: string;
    participantName: string;
    participantCpf: string;
    eventTitle: string;
    eventDate: Date;
    ticketType: string;
    ticketBatch: string;
    price: number;
    status: string;
    usedAt?: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  async validateVoucher(scannedCode: string): Promise<ValidationResult> {
    try {
      console.log('🔍 Validando código:', scannedCode);

      // Buscar voucher pelo código
      const vouchersRef = collection(db, 'vouchers');
      const q = query(vouchersRef, where('code', '==', scannedCode.toUpperCase()));
      const snapshot = await getDocs(q);

      // Voucher não encontrado
      if (snapshot.empty) {
        console.log('❌ Voucher não encontrado');
        return {
          valid: false,
          message: 'Voucher não encontrado. Código inválido.'
        };
      }

      const voucherDoc = snapshot.docs[0];
      const data = voucherDoc.data();

      // Voucher já foi usado
      if (data['status'] === 'used') {
        console.log('❌ Voucher já foi usado');
        const usedAt = data['usedAt']?.toDate();
        return {
          valid: false,
          message: `Este voucher já foi utilizado em ${this.formatDateTime(usedAt)}.`,
          voucher: {
            id: voucherDoc.id,
            code: data['code'],
            participantName: data['participantName'],
            participantCpf: data['participantCpf'],
            eventTitle: data['eventTitle'],
            eventDate: data['eventDate']?.toDate(),
            ticketType: data['ticketType'],
            ticketBatch: data['ticketBatch'],
            price: data['price'],
            status: data['status'],
            usedAt: usedAt
          }
        };
      }

      // Voucher cancelado
      if (data['status'] === 'cancelled') {
        console.log('❌ Voucher cancelado');
        return {
          valid: false,
          message: 'Este voucher foi cancelado e não é mais válido.',
          voucher: {
            id: voucherDoc.id,
            code: data['code'],
            participantName: data['participantName'],
            participantCpf: data['participantCpf'],
            eventTitle: data['eventTitle'],
            eventDate: data['eventDate']?.toDate(),
            ticketType: data['ticketType'],
            ticketBatch: data['ticketBatch'],
            price: data['price'],
            status: data['status']
          }
        };
      }

      // Voucher válido - marcar como usado
      if (data['status'] === 'active') {
        console.log('✅ Voucher válido - marcando como usado');
        
        await updateDoc(doc(db, 'vouchers', voucherDoc.id), {
          status: 'used',
          usedAt: Timestamp.now()
        });

        return {
          valid: true,
          message: 'Entrada permitida! Voucher validado com sucesso.',
          voucher: {
            id: voucherDoc.id,
            code: data['code'],
            participantName: data['participantName'],
            participantCpf: data['participantCpf'],
            eventTitle: data['eventTitle'],
            eventDate: data['eventDate']?.toDate(),
            ticketType: data['ticketType'],
            ticketBatch: data['ticketBatch'],
            price: data['price'],
            status: 'used',
            usedAt: new Date()
          }
        };
      }

      // Status desconhecido
      return {
        valid: false,
        message: 'Status do voucher desconhecido. Entre em contato com o suporte.'
      };

    } catch (error) {
      console.error('❌ Erro ao validar voucher:', error);
      return {
        valid: false,
        message: 'Erro ao validar voucher. Tente novamente.'
      };
    }
  }

  async checkVoucherStatus(code: string): Promise<ValidationResult> {
    try {
      const vouchersRef = collection(db, 'vouchers');
      const q = query(vouchersRef, where('code', '==', code.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          valid: false,
          message: 'Voucher não encontrado'
        };
      }

      const data = snapshot.docs[0].data();
      
      return {
        valid: data['status'] === 'active',
        message: `Status: ${this.getStatusText(data['status'])}`,
        voucher: {
          id: snapshot.docs[0].id,
          code: data['code'],
          participantName: data['participantName'],
          participantCpf: data['participantCpf'],
          eventTitle: data['eventTitle'],
          eventDate: data['eventDate']?.toDate(),
          ticketType: data['ticketType'],
          ticketBatch: data['ticketBatch'],
          price: data['price'],
          status: data['status'],
          usedAt: data['usedAt']?.toDate()
        }
      };
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        valid: false,
        message: 'Erro ao verificar status'
      };
    }
  }

  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativo (não usado)',
      'used': 'Já foi usado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  private formatDateTime(date?: Date): string {
    if (!date) return 'data desconhecida';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  }
}
