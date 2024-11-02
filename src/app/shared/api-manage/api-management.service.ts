import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Curriculum } from './models/Curriculum.model';
import { GoogleLink } from './models/GoogleLink.model';
import { UserToken } from './models/UserToken.model';
import { TranscriptData } from './models/TranscriptData.model';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
	providedIn: 'root',
})
export class APIManagementService {
	constructor(private http: HttpClient) {}

	GetAuthHeader(userTokenId: string) {
		const headers = new HttpHeaders().set(
			'Authorization',
			`Bearer ${userTokenId}`,
		);
		return headers;
	}

	GetUserOauthSignup() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-up`;
		return this.http.get<GoogleLink>(apiUrl);
	}

	GetUserOauthSignin() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-in`;
		return this.http.get<GoogleLink>(apiUrl);
	}

	GetUserToken(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/auth/token`;
		return this.http.post<UserToken>(apiUrl, {
			user_token_id: userTokenId,
		});
	}

	GetCurriculum() {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get`;
		return this.http.get<Curriculum[]>(apiUrl);
	}

	GetTranscriptData(userTokenId: string, userId?: string) {
		const apiUrl = `${environment.backendUrl}/api/transcript/get/${userId}`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.get<TranscriptData[]>(apiUrl, { headers });
	}

	UpdateUserTranscriptByUpload(
		userId: string,
		userTokenId: string,
		file: File,
	): Observable<HttpEvent<any>> {
		const apiUrl = `${environment.backendUrl}/api/transcript/upload`;
		const headers = this.GetAuthHeader(userTokenId);
		const formData: FormData = new FormData();
		formData.append('id', userId);
		formData.append('file', file, file.name);
		return this.http.post(apiUrl, formData, {
			headers,
			reportProgress: true,
			observe: 'events',
		});
	}

	UpdateUserCurriculum(userTokenId: string, userId?: string, curId?: Number) {
		const apiUrl = `${environment.backendUrl}/api/user/update`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.patch(
			apiUrl,
			{ id: userId, curriculum_id: curId },
			{ headers },
		);
	}

	UpdateUserOauthSignupCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;
		return this.http.post<UserToken>(apiUrl, {
			code: authCode,
			redirect_uri: 'sign-up',
		});
	}

	UpdateUserOauthSigninCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;
		return this.http.post<UserToken>(apiUrl, {
			code: authCode,
			redirect_uri: 'sign-in',
		});
	}

	SignoutUserfromSystem(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/auth/sign-out`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.post<UserToken>(
			apiUrl,
			{ user_token_id: userTokenId },
			{ headers },
		);
	}
}
