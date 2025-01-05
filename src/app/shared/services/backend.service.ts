import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class BackendService {
	private backendUrl: string;

	constructor() {
		this.backendUrl = environment.backendUrl;

		if (!this.backendUrl) {
			console.error(
				'ERROR: Backend URL is not specified in the environment.',
			);
			throw new Error('Backend URL is not defined in the environment.');
		}
		console.log(`Backend Service initialized with URL: ${this.backendUrl}`);
	}
	getBackendUrl(): string {
		return this.backendUrl;
	}
}
