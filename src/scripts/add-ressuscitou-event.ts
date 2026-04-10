import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvX7_zwsTOvaHCqze9GbDmt5OmiyyRPiI",
  authDomain: "ingressos-cfa85.firebaseapp.com",
  projectId: "ingressos-cfa85",
  storageBucket: "ingressos-cfa85.firebasestorage.app",
  messagingSenderId: "674243579015",
  appId: "1:674243579015:web:9ead6517f03e9062263c22"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRessuscitouEvent() {
  try {
    const eventData = {
      title: 'Festival Ressuscitou 2026',
      shortDescription: 'Um convite para viver a fé de forma profunda, alegre e inesquecível',
      description: `O Festival Ressuscitou nasce como um convite para viver a fé de forma profunda, alegre e inesquecível. Mais do que um evento, será um encontro de corações, de música, de esperança e de conexão com Deus.

Dois Dias Especiais em Junho - Porto Alegre será palco de momentos únicos de celebração.

Serão momentos únicos, onde milhares de pessoas poderão se reunir para celebrar, cantar, se emocionar e renovar sua fé — juntos, como uma só comunidade, vivendo algo que vai muito além de um festival.`,
      category: 'Festival',
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
      date: Timestamp.fromDate(new Date('2026-06-13T17:00:00')),
      endDate: Timestamp.fromDate(new Date('2026-06-14T23:00:00')),
      location: 'Parque Harmonia - Porto Alegre',
      venue: 'Parque Harmonia',
      city: 'Porto Alegre',
      state: 'RS',
      startTime: '17:00',
      endTime: '23:00',
      featured: true,
      ticketTypes: [
        {
          id: 'basico-lote1',
          name: 'Ingresso Básico',
          price: 120.00,
          description: 'Acesso completo aos dois dias do festival',
          available: 500,
          batch: 'Primeiro Lote',
          batchNumber: 1
        }
      ],
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'events'), eventData);
    console.log('✅ Evento criado com sucesso! ID:', docRef.id);
    console.log('📅 Festival Ressuscitou 2026 adicionado ao Firebase');
    
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
  }
}

addRessuscitouEvent();
