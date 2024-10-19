import { Component } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SDMButtonLink } from '../buttons/link/button-link.component';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [RouterLink, SDMButtonLink, CommonModule, IconComponent],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent {
	currentRoute: string = '';

	constructor(private router: Router) {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: any) => {
				this.currentRoute = event.url;
			});
	}

	isSignIn = false;

	toggleSignIn() {
		this.isSignIn = !this.isSignIn;
		console.log('SignIn : ', this.isSignIn);
	}
}
