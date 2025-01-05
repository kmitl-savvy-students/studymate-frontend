import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BackendService {
	private environmentFiles = [
		import('../../../environments/environment.prod'),
		import('../../../environments/environment.preprod'),
		import('../../../environments/environment.develop'),
	];

	backendUrl: string = '';

	constructor(private http: HttpClient) {}

	getBackendUrl(): string {
		return this.backendUrl;
	}

	async resolveAvailableBackendUrl() {
		for (const envFile of this.environmentFiles) {
			const environment = await envFile;
			const backendUrl = environment.environment.backendUrl;

			const isAvailable = await this.tryUrl(backendUrl);
			if (isAvailable) {
				this.backendUrl = backendUrl;
				console.log(`Using backend service from ${backendUrl}.`);
				return;
			}
		}
		console.error('ERROR: Any backend service URLs are not available.');
	}

	private async tryUrl(url: string): Promise<boolean> {
		try {
			await lastValueFrom(this.http.get(url, { responseType: 'text' }));
			return true;
		} catch (error: any) {
			if (error.status === 404) return true;
			return false;
		}
	}
}
