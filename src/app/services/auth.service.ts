import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase.config';

export interface UserData {
  uid: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  dataNascimento: Date;
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    cidade: string;
    estado: string;
  };
  role: 'INGRESSO_CLIENT';
  createdAt: Date;
}

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection = 'users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'vingo_auth_user';
  
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor() {
    console.log('🔧 AuthService: Inicializando');
    
    // Restaurar usuário do localStorage IMEDIATAMENTE (síncrono)
    const savedUser = this.getUserFromStorage();
    if (savedUser) {
      console.log('🔄 Restaurando usuário do localStorage:', savedUser.email);
      
      const mockUser = {
        uid: savedUser.uid,
        email: savedUser.email,
        displayName: savedUser.displayName
      } as User;
      
      this.currentUserSubject.next(mockUser);
      console.log('✅ Usuário restaurado imediatamente');
    } else {
      console.log('ℹ️ Nenhum usuário salvo no localStorage');
    }
    
    // Observar mudanças de autenticação do Firebase
    auth.onAuthStateChanged(user => {
      console.log('🔐 Firebase Auth state changed:', user ? user.email : 'não autenticado');
      
      if (user) {
        console.log('   - UID:', user.uid);
        console.log('   - Email:', user.email);
        console.log('   - DisplayName:', user.displayName);
        
        // Salvar no localStorage
        this.saveUserToStorage(user);
        this.currentUserSubject.next(user);
      } else {
        // Verificar se há usuário salvo no localStorage
        const savedUser = this.getUserFromStorage();
        if (savedUser) {
          console.log('⚠️ Firebase retornou null, mas há usuário no localStorage');
          console.log('   - Mantendo usuário:', savedUser.email);
          // Não limpar o subject, manter o usuário atual
        } else {
          console.log('   - Limpando estado de autenticação');
          this.clearUserFromStorage();
          this.currentUserSubject.next(null);
        }
      }
    });
  }

  private saveUserToStorage(user: User): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const storedUser: StoredUser = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedUser));
      console.log('💾 Usuário salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }

  private getUserFromStorage(): StoredUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const user: StoredUser = JSON.parse(stored);
      
      // Verificar se não expirou (24 horas)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - user.timestamp > maxAge) {
        console.log('⏰ Sessão expirada');
        this.clearUserFromStorage();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('❌ Erro ao ler localStorage:', error);
      return null;
    }
  }

  private clearUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Usuário removido do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const q = query(
      collection(db, this.usersCollection),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async checkCpfExists(cpf: string): Promise<boolean> {
    const q = query(
      collection(db, this.usersCollection),
      where('cpf', '==', cpf)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async register(userData: Omit<UserData, 'uid' | 'role' | 'createdAt'>, password: string): Promise<void> {
    // Verificar se email já existe
    const emailExists = await this.checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error('Este email já está cadastrado');
    }

    // Verificar se CPF já existe
    const cpfExists = await this.checkCpfExists(userData.cpf);
    if (cpfExists) {
      throw new Error('Este CPF já está cadastrado');
    }

    // Criar usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      password
    );

    // Atualizar perfil com nome
    await updateProfile(userCredential.user, {
      displayName: `${userData.nome} ${userData.sobrenome}`
    });

    // Salvar dados completos no Firestore
    const userDataComplete: UserData = {
      uid: userCredential.user.uid,
      ...userData,
      role: 'INGRESSO_CLIENT',
      createdAt: new Date()
    };

    await addDoc(collection(db, this.usersCollection), userDataComplete);
  }

  async login(email: string, password: string): Promise<User> {
    console.log('🔐 Login: Iniciando login para', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login: Sucesso! UID:', userCredential.user.uid);
    
    // Salvar explicitamente no localStorage
    this.saveUserToStorage(userCredential.user);
    this.currentUserSubject.next(userCredential.user);
    
    return userCredential.user;
  }

  async logout(): Promise<void> {
    console.log('👋 Logout: Deslogando usuário');
    this.clearUserFromStorage();
    this.currentUserSubject.next(null);
    await signOut(auth);
  }

  async getUserData(uid: string): Promise<UserData | null> {
    const q = query(
      collection(db, this.usersCollection),
      where('uid', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      dataNascimento: doc.data()['dataNascimento'].toDate(),
      createdAt: doc.data()['createdAt'].toDate()
    } as UserData;
  }
}
