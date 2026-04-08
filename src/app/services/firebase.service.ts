import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface Event {
  id?: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl?: string;
}

export interface Ticket {
  id?: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private eventsCollection = 'events';
  private ticketsCollection = 'tickets';

  // Events
  async getEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, this.eventsCollection));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data()['date'].toDate()
    } as Event));
  }

  async addEvent(event: Omit<Event, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.eventsCollection), {
      ...event,
      date: Timestamp.fromDate(event.date)
    });
    return docRef.id;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<void> {
    const eventRef = doc(db, this.eventsCollection, id);
    const updateData: any = { ...event };
    if (event.date) {
      updateData.date = Timestamp.fromDate(event.date);
    }
    await updateDoc(eventRef, updateData);
  }

  async deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(db, this.eventsCollection, id));
  }

  // Tickets
  async purchaseTicket(ticket: Omit<Ticket, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.ticketsCollection), {
      ...ticket,
      purchaseDate: Timestamp.fromDate(ticket.purchaseDate)
    });
    
    // Update available tickets
    const eventRef = doc(db, this.eventsCollection, ticket.eventId);
    const event = await this.getEventById(ticket.eventId);
    if (event) {
      await updateDoc(eventRef, {
        availableTickets: event.availableTickets - ticket.quantity
      });
    }
    
    return docRef.id;
  }

  async getTicketsByEvent(eventId: string): Promise<Ticket[]> {
    const q = query(
      collection(db, this.ticketsCollection),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      purchaseDate: doc.data()['purchaseDate'].toDate()
    } as Ticket));
  }

  private async getEventById(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === id) || null;
  }
}
