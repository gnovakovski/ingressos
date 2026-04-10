import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Firebase...');
    
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    
    console.log(`\n✅ Conexão OK! ${snapshot.docs.length} eventos encontrados:\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data['title'] || 'Sem título'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Categoria: ${data['category'] || 'N/A'}`);
      console.log(`   Featured: ${data['featured'] || false}`);
      console.log(`   Ingressos: ${data['ticketTypes']?.length || 0} tipos`);
      console.log('');
    });
    
    if (snapshot.docs.length === 0) {
      console.log('⚠️  Nenhum evento encontrado na collection "events"');
      console.log('Execute: npm run add-event');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
  }
}

testConnection();
