import { Injectable } from '@angular/core';
import { collection, getDocs, query, where, Timestamp, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase.config';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export interface Voucher {
  id: string;
  code: string; // Código único para QR e barcode
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  eventAddress: string;
  ticketType: string;
  ticketBatch: string;
  price: number;
  participantName: string;
  participantCpf: string;
  participantBirthDate: string;
  purchaseDate: Date;
  status: 'active' | 'used' | 'cancelled';
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  generateUniqueCode(): string {
    // Gera código único: 2 letras + 6 números + 2 letras
    const letters1 = String.fromCharCode(65 + Math.floor(Math.random() * 26), 65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(100000 + Math.random() * 900000);
    const letters2 = String.fromCharCode(65 + Math.floor(Math.random() * 26), 65 + Math.floor(Math.random() * 26));
    return `${letters1}${numbers}${letters2}`;
  }

  async generateQRCode(code: string): Promise<string> {
    try {
      return await QRCode.toDataURL(code, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  }

  generateBarcode(code: string): string {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, code, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Erro ao gerar código de barras:', error);
      return '';
    }
  }

  async createVouchers(
    userId: string,
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    eventAddress: string,
    tickets: Array<{
      ticketType: string;
      ticketBatch: string;
      price: number;
      participantName: string;
      participantCpf: string;
      participantBirthDate: string;
      ticketTypeId: string; // ID do tipo de ingresso para decrementar
    }>
  ): Promise<Voucher[]> {
    const vouchers: Voucher[] = [];

    try {
      console.log('🎫 Criando vouchers e atualizando estoque...');
      console.log('   - Total de ingressos:', tickets.length);
      
      // Contar quantos ingressos de cada tipo
      const ticketCounts = new Map<string, number>();
      tickets.forEach(ticket => {
        const count = ticketCounts.get(ticket.ticketTypeId) || 0;
        ticketCounts.set(ticket.ticketTypeId, count + 1);
      });

      console.log('   - Tipos de ingresso:', Array.from(ticketCounts.entries()).map(([id, count]) => `${id}: ${count}`));

      // Usar transação para garantir atomicidade
      await runTransaction(db, async (transaction) => {
        // 1. Verificar disponibilidade e reservar ingressos
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) {
          throw new Error('Evento não encontrado');
        }

        const eventData = eventDoc.data();
        const ticketTypes = eventData['ticketTypes'] || [];

        // Verificar se há ingressos disponíveis
        for (const [ticketTypeId, quantity] of ticketCounts.entries()) {
          const ticketType = ticketTypes.find((t: any) => t.id === ticketTypeId);
          
          if (!ticketType) {
            throw new Error(`Tipo de ingresso ${ticketTypeId} não encontrado`);
          }

          if (ticketType.available < quantity) {
            throw new Error(`Ingressos insuficientes para ${ticketType.name}. Disponível: ${ticketType.available}, Solicitado: ${quantity}`);
          }

          console.log(`   ✅ ${ticketType.name}: ${ticketType.available} disponíveis, reservando ${quantity}`);
        }

        // 2. Atualizar quantidade disponível de cada tipo
        const updatedTicketTypes = ticketTypes.map((ticketType: any) => {
          const quantity = ticketCounts.get(ticketType.id) || 0;
          if (quantity > 0) {
            console.log(`   📉 Decrementando ${ticketType.name}: ${ticketType.available} → ${ticketType.available - quantity}`);
            return {
              ...ticketType,
              available: ticketType.available - quantity
            };
          }
          return ticketType;
        });

        transaction.update(eventRef, { ticketTypes: updatedTicketTypes });

        // 3. Criar vouchers
        for (const ticket of tickets) {
          const code = this.generateUniqueCode();
          const qrCodeDataUrl = await this.generateQRCode(code);
          const barcodeDataUrl = this.generateBarcode(code);

          const voucherData = {
            code,
            userId,
            eventId,
            eventTitle,
            eventDate: Timestamp.fromDate(eventDate),
            eventLocation,
            eventAddress,
            ticketType: ticket.ticketType,
            ticketBatch: ticket.ticketBatch,
            price: ticket.price,
            participantName: ticket.participantName,
            participantCpf: ticket.participantCpf,
            participantBirthDate: ticket.participantBirthDate,
            purchaseDate: Timestamp.now(),
            status: 'active'
          };

          const voucherRef = doc(collection(db, 'vouchers'));
          transaction.set(voucherRef, voucherData);

          vouchers.push({
            id: voucherRef.id,
            code,
            userId,
            eventId,
            eventTitle,
            eventDate,
            eventLocation,
            eventAddress,
            ticketType: ticket.ticketType,
            ticketBatch: ticket.ticketBatch,
            price: ticket.price,
            participantName: ticket.participantName,
            participantCpf: ticket.participantCpf,
            participantBirthDate: ticket.participantBirthDate,
            purchaseDate: new Date(),
            status: 'active',
            qrCodeDataUrl,
            barcodeDataUrl
          });
        }
      });

      console.log('✅ Vouchers criados e estoque atualizado com sucesso');
      return vouchers;
    } catch (error) {
      console.error('❌ Erro ao criar vouchers:', error);
      throw error;
    }
  }

  async getUserVouchers(userId: string): Promise<Voucher[]> {
    console.log('🔍 VoucherService.getUserVouchers INICIADO');
    console.log('👤 Buscando vouchers para userId:', userId);
    
    try {
      const vouchersRef = collection(db, 'vouchers');
      console.log('📚 Referência da coleção criada');
      
      const q = query(vouchersRef, where('userId', '==', userId));
      console.log('🔎 Query criada com filtro userId ==', userId);
      
      console.log('⏳ Executando getDocs...');
      const snapshot = await getDocs(q);
      console.log('✅ getDocs concluído');
      console.log('📦 Total de documentos retornados:', snapshot.size);
      console.log('📦 Snapshot vazio?', snapshot.empty);
      
      if (snapshot.empty) {
        console.log('⚠️ NENHUM VOUCHER ENCONTRADO para userId:', userId);
        console.log('💡 Verifique se:');
        console.log('   1. O userId no banco está correto');
        console.log('   2. Existem documentos na coleção vouchers');
        console.log('   3. O campo userId existe nos documentos');
        return [];
      }

      console.log('📋 Processando', snapshot.size, 'documentos...');
      const vouchers: Voucher[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Doc ID:', doc.id);
        console.log('   - code:', data['code']);
        console.log('   - userId:', data['userId']);
        console.log('   - eventTitle:', data['eventTitle']);
        console.log('   - participantName:', data['participantName']);
        
        const voucher: Voucher = {
          id: doc.id,
          code: data['code'],
          userId: data['userId'],
          eventId: data['eventId'],
          eventTitle: data['eventTitle'],
          eventDate: data['eventDate']?.toDate() || new Date(),
          eventLocation: data['eventLocation'],
          eventAddress: data['eventAddress'],
          ticketType: data['ticketType'],
          ticketBatch: data['ticketBatch'],
          price: data['price'],
          participantName: data['participantName'],
          participantCpf: data['participantCpf'],
          participantBirthDate: data['participantBirthDate'],
          purchaseDate: data['purchaseDate']?.toDate() || new Date(),
          status: data['status'] || 'active',
          qrCodeDataUrl: '',
          barcodeDataUrl: ''
        };
        
        vouchers.push(voucher);
      });

      console.log('✅ Total de vouchers processados:', vouchers.length);
      
      // Gerar QR Code e Barcode para cada voucher
      console.log('🎨 Gerando QR Codes e Barcodes...');
      for (const voucher of vouchers) {
        voucher.qrCodeDataUrl = await this.generateQRCode(voucher.code);
        voucher.barcodeDataUrl = this.generateBarcode(voucher.code);
        console.log('✅ QR/Barcode gerados para:', voucher.code);
      }

      console.log('🎉 getUserVouchers CONCLUÍDO com sucesso');
      console.log('📊 Retornando', vouchers.length, 'vouchers');
      
      return vouchers.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
      
    } catch (error) {
      console.error('❌ ERRO em getUserVouchers:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem:', (error as Error).message);
      console.error('❌ Stack:', (error as Error).stack);
      throw error;
    }
  }

  async getEventVouchers(eventId: string): Promise<Voucher[]> {
    try {
      const vouchersRef = collection(db, 'vouchers');
      const q = query(vouchersRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(q);

      const vouchers: Voucher[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        const qrCodeDataUrl = await this.generateQRCode(data['code']);
        const barcodeDataUrl = this.generateBarcode(data['code']);

        vouchers.push({
          id: doc.id,
          code: data['code'],
          userId: data['userId'],
          eventId: data['eventId'],
          eventTitle: data['eventTitle'],
          eventDate: data['eventDate']?.toDate() || new Date(),
          eventLocation: data['eventLocation'],
          eventAddress: data['eventAddress'],
          ticketType: data['ticketType'],
          ticketBatch: data['ticketBatch'],
          price: data['price'],
          participantName: data['participantName'],
          participantCpf: data['participantCpf'],
          participantBirthDate: data['participantBirthDate'],
          purchaseDate: data['purchaseDate']?.toDate() || new Date(),
          status: data['status'] || 'active',
          qrCodeDataUrl,
          barcodeDataUrl
        });
      }

      return vouchers;
    } catch (error) {
      console.error('Erro ao buscar vouchers do evento:', error);
      return [];
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  formatPrice(price: number): string {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }
}
