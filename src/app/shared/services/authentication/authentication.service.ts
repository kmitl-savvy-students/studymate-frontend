import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserToken } from '../../models/UserToken.model';
import { User } from '../../models/User.model';
import { BackendService } from '../backend.service';
import { AlertService } from '../alert/alert.service';
import { LoadingService } from '../loading/loading.service';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private tokenSubject = new BehaviorSubject<string | null>(null);
	private userSubject = new BehaviorSubject<User | null>(null);

	constructor(
		private backendService: BackendService,
		private http: HttpClient,
		private router: Router,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {
		const existingToken = localStorage.getItem('userToken');
		if (existingToken) {
			this.tokenSubject.next(existingToken);
			this.validateToken(existingToken);
		}
	}

	get token$() {
		return this.tokenSubject.asObservable();
	}

	get user$() {
		return this.userSubject.asObservable();
	}

	get currentToken(): string | null {
		return this.tokenSubject.value;
	}

	get currentUser(): User | null {
		return this.userSubject.value;
	}

	handleGoogleCallback(
		authCode: string,
		redirectUri: 'sign-in' | 'sign-up',
	): Promise<UserToken> {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/google/callback`;
		return lastValueFrom(
			this.http.post<UserToken>(apiUrl, {
				code: authCode,
				redirect_uri: redirectUri,
			}),
		);
	}

	async signIn(token: string): Promise<void> {
		try {
			localStorage.setItem('userToken', token);
			this.tokenSubject.next(token);
			await this.validateToken(token);
		} catch (error) {
			console.error('Error during sign-in:', error);
			this.loadingService.show(() => {
				this.alertService.showAlert(
					'error',
					'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
				);
				this.router.navigate(['/sign-in']);
			});
		}
	}

	signOut(): void {
		localStorage.removeItem('userToken');
		this.tokenSubject.next(null);
		this.userSubject.next(null);
		this.router.navigate(['/sign-in']);
	}

	private async validateToken(token: string): Promise<void> {
		try {
			const backendUrl = this.backendService.getBackendUrl();
			const apiUrl = `${backendUrl}/api/auth/token`;

			const response = await lastValueFrom(
				this.http.post<UserToken>(apiUrl, { user_token_id: token }),
			);

			this.userSubject.next(response.user);
		} catch (error) {
			console.error('Token validation failed:', error);
			this.loadingService.show(() => {
				this.signOut();
				this.alertService.showAlert(
					'error',
					'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
				);
				this.router.navigate(['/sign-in']);
			});
		}
	}

	isAuthenticated(): boolean {
		return !!this.currentToken && !!this.currentUser;
	}
}
