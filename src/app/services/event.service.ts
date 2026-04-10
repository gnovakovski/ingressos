import { Injectable } from '@angular/core';
import { collection, addDoc, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  batch: string;
  batchNumber: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  date: Date;
  endDate?: Date;
  location: string;
  venue: string;
  city: string;
  state: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketType[];
  featured: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsCache: Event[] | null = null;
  private loadingPromise: Promise<Event[]> | null = null;
  
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        date: Timestamp.fromDate(eventData.date),
        endDate: eventData.endDate ? Timestamp.fromDate(eventData.endDate) : null,
        createdAt: Timestamp.now()
      });
      
      this.eventsCache = null;
      this.loadingPromise = null;
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<Event[]> {
    // Se já tem cache, retorna
    if (this.eventsCache) {
      console.log('📦 Cache');
      return this.eventsCache;
    }

    // Se já está carregando, espera a mesma promise
    if (this.loadingPromise) {
      console.log('⏳ Aguardando carregamento em andamento');
      return this.loadingPromise;
    }

    // Inicia novo carregamento
    console.log('🔄 Buscando do Firebase');
    this.loadingPromise = this.fetchEventsFromFirebase();
    
    try {
      const events = await this.loadingPromise;
      this.eventsCache = events;
      return events;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async fetchEventsFromFirebase(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      
      console.log(`✅ ${snapshot.docs.length} eventos encontrados`);
      
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data['title'] || '',
          description: data['description'] || '',
          shortDescription: data['shortDescription'] || '',
          category: data['category'] || '',
          image: data['image'] || '',
          date: data['date']?.toDate() || new Date(),
          endDate: data['endDate']?.toDate(),
          location: data['location'] || '',
          venue: data['venue'] || '',
          city: data['city'] || '',
          state: data['state'] || '',
          startTime: data['startTime'] || '',
          endTime: data['endTime'] || '',
          ticketTypes: data['ticketTypes'] || [],
          featured: data['featured'] || false,
          createdAt: data['createdAt']?.toDate() || new Date()
        };
      });
      
      return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      // Tentar do cache primeiro
      if (this.eventsCache) {
        const cached = this.eventsCache.find(e => e.id === eventId);
        if (cached) {
          console.log('📦 Cache - evento:', eventId);
          return cached;
        }
      }

      console.log('🔄 Buscando evento do Firebase:', eventId);
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('❌ Evento não encontrado:', eventId);
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data['title'] || '',
        description: data['description'] || '',
        shortDescription: data['shortDescription'] || '',
        category: data['category'] || '',
        image: data['image'] || '',
        date: data['date']?.toDate() || new Date(),
        endDate: data['endDate']?.toDate(),
        location: data['location'] || '',
        venue: data['venue'] || '',
        city: data['city'] || '',
        state: data['state'] || '',
        startTime: data['startTime'] || '',
        endTime: data['endTime'] || '',
        ticketTypes: data['ticketTypes'] || [],
        featured: data['featured'] || false,
        createdAt: data['createdAt']?.toDate() || new Date()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar evento:', error);
      return null;
    }
  }

  async getFeaturedEvents(): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.featured);
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.category === category);
  }

  clearCache(): void {
    this.eventsCache = null;
    this.loadingPromise = null;
  }
}
