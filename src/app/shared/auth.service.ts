import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private userToken: string | null = null;
	public tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
		string | null
	>(null);

	setToken(token: string): void {
		this.userToken = token;
		sessionStorage.setItem('userToken', token);
		this.tokenSubject.next(token);
	}
	getToken(): string | null {
		if (!this.userToken) {
			this.userToken = sessionStorage.getItem('userToken');
			this.tokenSubject.next(this.userToken);
		}
		return this.userToken;
	}
	clearToken(): void {
		this.userToken = null;
		sessionStorage.removeItem('userToken');
		this.tokenSubject.next(null);
	}
}
