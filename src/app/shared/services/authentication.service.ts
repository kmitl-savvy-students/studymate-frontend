import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
	setToken(token: string) {
		localStorage.setItem('userToken', token);
	}
	getToken(): string {
		return localStorage.getItem('userToken') ?? '';
	}
	removeToken() {
		localStorage.removeItem('userToken');
	}
}
