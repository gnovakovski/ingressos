import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection = 'users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  constructor() {
    auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
    });
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async logout(): Promise<void> {
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
