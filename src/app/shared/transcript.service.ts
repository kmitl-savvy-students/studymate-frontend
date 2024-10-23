import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class TranscriptService {
	private apiUrl = environment.backendUrl + '/api/transcript/get-by-user';

	constructor(private http: HttpClient) {}

	getTranscriptData(userTokenId: string): Observable<any> {
		const payload = { userTokenId };
		return this.http.post<any>(this.apiUrl, payload);
	}
}
