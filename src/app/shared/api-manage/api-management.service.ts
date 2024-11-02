import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Curriculum } from './models/Curriculum';
import { GoogleLink } from './models/GoogleLink';
import { UserToken } from './models/UserToken';

@Injectable({
	providedIn: 'root',
})
export class APIManagementService {
	constructor(private http: HttpClient) {}
	GetCurriculum() {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get`;
		return this.http.get<Curriculum[]>(apiUrl);
	}

	GetUserOauthSignup() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-up`;
		return this.http.get<GoogleLink>(apiUrl);
	}

	UpdateUserCurriculum(userId: Number, curId: Number) {
		const apiUrl = `${environment.backendUrl}/api/user/update`;
		return this.http.patch(apiUrl, {
			id: userId,
			curriculum: { id: curId },
		});
	}

	UpdateUserOauthSignupCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;
		return this.http.post<UserToken>(apiUrl, {
			code: authCode,
			redirect_uri: 'sign-up',
		});
	}
}
