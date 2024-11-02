import { Injectable } from '@angular/core';
import { User } from './api-manage/models/User';
import { UserToken } from './api-manage/models/UserToken';
import { BehaviorSubject, Observable } from 'rxjs';
import { APIManagementService } from './api-manage/api-management.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private apiManagementService: APIManagementService) {
		// Automatically attempt to load the token when the service is instantiated
		this.getToken().subscribe();
	}

	public userTokenSubject: BehaviorSubject<UserToken | null> =
		new BehaviorSubject<UserToken | null>(null);

	private userToken: UserToken | null = null;

	signIn(userToken: UserToken): void {
		this.setToken(userToken);
	}

	signOut(): void {
		const id = sessionStorage.getItem('userTokenId');
		this.clearToken();
		this.apiManagementService.SignoutUserfromSystem(id!).subscribe({
			error: (error) => {
				if (error.status === 404) {
					console.error('Not found');
				} else if (error.status === 500) {
					console.error('Internal Server Error');
				} else {
					console.error(
						'An unexpected error occurred:',
						error.status,
					);
				}
			},
		});
	}

	setToken(userToken: UserToken): void {
		this.userToken = userToken;
		this.userTokenSubject.next(userToken);
		sessionStorage.setItem('userTokenId', userToken.id);
	}

	getToken(): Observable<UserToken | null> {
		const id = sessionStorage.getItem('userTokenId');
		return new Observable<UserToken | null>((observer) => {
			if (!id) {
				this.userToken = null;
				this.userTokenSubject.next(null);
				observer.next(null);
				observer.complete();
				return;
			}

			if (this.userToken) {
				this.userTokenSubject.next(this.userToken);
				observer.next(this.userToken);
				observer.complete();
				return;
			}

			this.apiManagementService.GetUserToken(id).subscribe({
				next: (response) => {
					this.userToken = response;
					this.userTokenSubject.next(this.userToken);
					observer.next(this.userToken);
					observer.complete();
				},
				error: (error) => {
					console.error(error);
					this.userTokenSubject.next(null);
					observer.next(null);
					observer.complete();
				},
			});
		});
	}

	clearToken(): void {
		this.userToken = null;
		this.userTokenSubject.next(null);
		sessionStorage.removeItem('userTokenId');
	}
}
