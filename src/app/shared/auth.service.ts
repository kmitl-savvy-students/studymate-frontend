import { Injectable } from '@angular/core';
import { User } from './api-manage/models/User';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BaseResponse } from './api-manage/models/BaseResponse';
import { UserToken } from './api-manage/models/UserToken';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private http: HttpClient) {
		// Automatically attempt to load the token when the service is instantiated
		this.getToken().subscribe();
	}

	public userTokenSubject: BehaviorSubject<UserToken | null> =
		new BehaviorSubject<UserToken | null>(null);

	private userToken: UserToken | null = null;
	private user: User | null = null;

	getUser(userToken: UserToken): Observable<User | null> {
		if (!userToken) {
			return of(null);
		}

		const apiUrl = `${environment.backendUrl}/api/user`;
		const id = userToken.id;

		return this.http
			.post<BaseResponse<User>>(apiUrl, { userTokenId: id })
			.pipe(
				map((response) => {
					if (response.code !== '200') {
						console.log(response.message);
						return null;
					}

					this.user = response.data;
					return this.user;
				}),
			);
	}

	signIn(userToken: UserToken): void {
		this.setToken(userToken);
	}

	signOut(): void {
		const apiUrl = `${environment.backendUrl}/api/auth/sign-out`;
		const id = sessionStorage.getItem('userTokenId');

		this.clearToken();
		this.http
			.post<BaseResponse<UserToken>>(apiUrl, { userTokenId: id })
			.subscribe((response) => {
				if (response.code !== '200') {
					console.log(response.message);
					return;
				}
			});
	}

	setToken(userToken: UserToken): void {
		this.userToken = userToken;
		this.userTokenSubject.next(userToken);
		sessionStorage.setItem('userTokenId', userToken.id);
	}

	getToken(): Observable<UserToken | null> {
		const id = sessionStorage.getItem('userTokenId');
		if (!id) {
			this.userToken = null;
			this.userTokenSubject.next(null);
			return of(null);
		}

		if (this.userToken) {
			this.userTokenSubject.next(this.userToken);
			return of(this.userToken);
		}

		const apiUrl = `${environment.backendUrl}/api/auth/token`;

		return this.http
			.post<BaseResponse<UserToken>>(apiUrl, { userTokenId: id })
			.pipe(
				map((response) => {
					if (response.code !== '200') {
						console.log(response.message);
						return null;
					}

					this.userToken = response.data;
					this.userTokenSubject.next(this.userToken);
					return this.userToken;
				}),
			);
	}

	clearToken(): void {
		this.userToken = null;
		this.userTokenSubject.next(null);
		sessionStorage.removeItem('userTokenId');
	}
}
