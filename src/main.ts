import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from '@services/authentication/authentication.interceptor';
import { AppComponent } from 'app.component';
import { appConfig } from 'app.config';

bootstrapApplication(AppComponent, {
	providers: [provideHttpClient(withInterceptors([authInterceptor])), provideAnimationsAsync(), ...appConfig.providers],
}).catch((err) => console.error(err));
