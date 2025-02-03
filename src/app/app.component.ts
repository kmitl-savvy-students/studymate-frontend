import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { AlertComponent } from '@services/alert/alert.component';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { FontAwesomeIconsService } from '@services/font-awesome-icons.service';
import { LoadingOverlayComponent } from '@services/loading/loading-overlay.component';
import { initFlowbite } from 'flowbite';

@Component({
	standalone: true,
	selector: 'app-root',
	imports: [RouterOutlet, NavbarComponent, FooterComponent, AlertComponent, CommonModule, LoadingOverlayComponent],
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
	constructor(
		public router: Router,
		public fontAwesomeService: FontAwesomeIconsService,
		private authService: AuthenticationService,
	) {}

	async ngOnInit() {
		initFlowbite();
		this.applyDarkMode();
		await this.authService.validate();
	}

	applyDarkMode() {
		if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	isAuthentication(): boolean {
		const urlPath = this.router.url.split('?')[0];
		return urlPath == '/sign-up' || urlPath == '/sign-in';
	}
}
