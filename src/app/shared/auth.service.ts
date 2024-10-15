import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private userToken: string | null = null;

	setToken(token: string): void {
		this.userToken = token;
	}
	getToken(): string | null {
		return this.userToken;
	}
	clearToken(): void {
		this.userToken = null;
	}
}
