import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class TranscriptUploadService {
	private uploadUrl = environment.backendUrl + '/api/transcript/upload';

	constructor(private http: HttpClient) {}

	uploadTranscript(
		file: File,
		userTokenId: string,
	): Observable<HttpEvent<any>> {
		const formData: FormData = new FormData();
		formData.append('userTokenId', userTokenId);
		formData.append('file', file, file.name);

		return this.http.post(this.uploadUrl, formData, {
			reportProgress: true,
			observe: 'events',
		});
	}
}
