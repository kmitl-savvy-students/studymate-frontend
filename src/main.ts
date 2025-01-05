import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/shared/services/authentication/authentication.interceptor';

bootstrapApplication(AppComponent, {
	providers: [
		provideHttpClient(withInterceptors([authInterceptor])),
		provideAnimationsAsync(),
		...appConfig.providers,
	],
}).catch((err) => console.error(err));
