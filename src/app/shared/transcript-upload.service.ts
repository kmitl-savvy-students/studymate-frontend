import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class TranscriptUploadService {
	private uploadUrl = environment.backendUrl + '/api/transcript/upload';

	constructor(private http: HttpClient) {}

	uploadTranscript(file: File): Observable<HttpEvent<any>> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);

		return this.http
			.post(this.uploadUrl, formData, {
				reportProgress: true,
				observe: 'events',
			})
			.pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(
				`Backend returned code ${error.status}, ` +
					`body was: ${error.error}`,
			);
		}
		return throwError('Something bad happened; please try again later.');
	}
}
