import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
	private tokenSubject = new BehaviorSubject<string | null>(null);

	constructor() {
		const existingToken = localStorage.getItem('userToken');
		if (existingToken) this.tokenSubject.next(existingToken);
	}

	get token$(): Observable<string | null> {
		return this.tokenSubject.asObservable();
	}

	signIn(token: string): void {
		localStorage.setItem('userToken', token);
		this.tokenSubject.next(token);
	}
	signOut(): void {
		localStorage.removeItem('userToken');
		this.tokenSubject.next(null);
	}
	get currentToken(): string | null {
		return this.tokenSubject.value;
	}
}
