import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from 'app.routes';

export const appConfig: ApplicationConfig = {
	// providers: [provideRouter(routes), provideHttpClient(withFetch())],
	providers: [
		provideRouter(
			routes,
			withRouterConfig({ onSameUrlNavigation: 'reload' }), // ✅ ตั้งค่าให้ navigate ไป URL เดิมได้
		),
		provideHttpClient(withFetch()),
	],
};
