import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
	providers: [provideAnimationsAsync(), ...appConfig.providers],
}).catch((err) => console.error(err));
