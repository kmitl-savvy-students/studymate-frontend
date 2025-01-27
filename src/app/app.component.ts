import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { initFlowbite } from 'flowbite';
import { AlertComponent } from './shared/services/alert/alert.component';
import { FontAwesomeIconsService } from './shared/services/font-awesome-icons.service';
import { LoadingOverlayComponent } from './shared/services/loading/loading-overlay.component';
import { SelectCurriculumModalComponent } from './components/select-curriculum/select-curriculum-modal.component';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from './shared/services/authentication/authentication.service';

@Component({
	standalone: true,
	selector: 'app-root',
	imports: [
		RouterOutlet,
		NavbarComponent,
		FooterComponent,
		AlertComponent,
		CommonModule,
		LoadingOverlayComponent,
		SelectCurriculumModalComponent,
	],
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
	constructor(
		public router: Router,
		public fontAwesomeService: FontAwesomeIconsService,
		private authService: AuthenticationService,
	) {}

	shouldShowNavbarAndFooter(): boolean {
		const urlPath = this.router.url.split('?')[0];
		return urlPath !== '/sign-up' && urlPath !== '/sign-in';
	}

	async ngOnInit() {
		initFlowbite();
		await this.authService.validate();
	}
}
