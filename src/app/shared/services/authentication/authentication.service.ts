import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom, map, Observable } from 'rxjs';
import { User } from '../../models/User.model';
import { UserToken } from '../../models/UserToken.model';
import { AlertService } from '../alert/alert.service';
import { BackendService } from '../backend.service';
import { LoadingService } from '../loading/loading.service';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationService {
	private userSubject = new BehaviorSubject<User | null>(null);
	private isValidating = false;
	private validationPromise: Promise<boolean> | null = null;

	constructor(
		private backendService: BackendService,
		private http: HttpClient,
		private router: Router,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {}

	get user$() {
		return this.userSubject.asObservable();
	}
	get signedIn$(): Observable<boolean> {
		return this.user$.pipe(map((user) => !!user));
	}

	get currentUser(): User | null {
		return this.userSubject.value;
	}

	async handleGoogleCallback(authCode: string, redirectUri: 'sign-in' | 'sign-up'): Promise<UserToken> {
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
			this.loadingService.register('Signing In');
			localStorage.setItem('userToken', token);
			await this.validate();
		} catch (error) {
			console.error('Error during sign-in:', error);
			this.alertService.showAlert('error', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
			this.router.navigate(['/sign-in']);
		} finally {
			this.loadingService.ready('Signing In');
		}
	}

	signOut(): void {
		localStorage.removeItem('userToken');
		this.userSubject.next(null);
		this.router.navigate(['/sign-in']);
	}

	async validate(): Promise<boolean> {
		console.log('DEBUG: [AUTHENTICATION VALIDATOR] Try to validate user...');
		if (this.currentUser) {
			console.log('DEBUG: [AUTHENTICATION VALIDATOR] User existed already and authenticated.');
			return true;
		}

		if (this.isValidating) {
			console.log('DEBUG: [AUTHENTICATION VALIDATOR] Already validating, redundant call removed.');
			return this.validationPromise ?? Promise.resolve(false);
		}

		const existingToken = localStorage.getItem('userToken');
		if (!existingToken) {
			console.log('DEBUG: [AUTHENTICATION VALIDATOR] User validation failed, no token found.');
			return false;
		}

		console.log('DEBUG: [AUTHENTICATION VALIDATOR] Validating...');

		this.loadingService.register('Authentication Validator');
		this.isValidating = true;
		this.validationPromise = new Promise<boolean>(async (resolve) => {
			try {
				const backendUrl = this.backendService.getBackendUrl();
				const apiUrl = `${backendUrl}/api/auth/token`;

				const response = await lastValueFrom(
					this.http.post<UserToken>(apiUrl, {
						user_token_id: existingToken,
					}),
				);

				this.userSubject.next(response.user);
				console.log(`DEBUG: [AUTHENTICATION VALIDATOR] Token validated. User authenticated with ID ${response.user.id}`);
				resolve(true);
			} catch (error) {
				console.error('Token validation failed:', error);
				this.signOut();
				this.alertService.showAlert('error', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
				resolve(false);
			} finally {
				this.isValidating = false;
				this.validationPromise = null;
				this.loadingService.ready('Authentication Validator');
			}
		});

		return this.validationPromise;
	}
}
