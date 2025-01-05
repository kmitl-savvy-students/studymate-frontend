import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { LoadingService } from './loading/loading.service';

@Injectable({
	providedIn: 'root',
})
export class BackendService implements OnInit {
	private environmentFiles = [
		import('../../../environments/environment.prod'),
		import('../../../environments/environment.preprod'),
		import('../../../environments/environment.develop'),
	];

	backendUrl: string = '';

	constructor(
		private http: HttpClient,
		private loadingService: LoadingService,
	) {}

	ngOnInit(): void {
		this.loadingService.register();
	}

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
				this.loadingService.ready();
				return;
			}
		}
		this.loadingService.ready();
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
