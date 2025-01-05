import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { initFlowbite } from 'flowbite';
import { AlertComponent } from './shared/services/alert/alert.component';
import { FontAwesomeIconsService } from './shared/services/font-awesome-icons.service';
import { LoadingOverlayComponent } from './shared/services/loading/loading-overlay.component';
import { LoadingService } from './shared/services/loading/loading.service';

@Component({
	standalone: true,
	selector: 'app-root',
	imports: [
		RouterOutlet,
		NavbarComponent,
		FooterComponent,
		AlertComponent,
		LoadingOverlayComponent,
	],
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
	backendUrl: string | null = null;

	constructor(
		public router: Router,
		public fontAwesomeService: FontAwesomeIconsService,
		private loadingService: LoadingService,
	) {}

	ngOnInit() {
		initFlowbite();
		this.loadingService.show(() => {
			this.loadingService.hide();
		});
	}
}
