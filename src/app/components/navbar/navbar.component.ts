import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { StudyMateLogo } from '../logo/studymate-logo.component';
import { SDMButtonNav } from './navbar-button.component';
import { SDMButtonLink } from '../buttons/button-link.component';
import { SDMAvatarDropdownNav } from './navbar-avatar-dropdown';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [
		CommonModule,
		StudyMateLogo,
		SDMButtonNav,
		SDMButtonLink,
		SDMAvatarDropdownNav,
	],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
	constructor(private authService: AuthenticationService) {}

	signedIn: boolean = false;
	token: string | null = null;
	ngOnInit(): void {
		this.authService.token$.subscribe((token) => {
			this.signedIn = !!token;
			this.token = token;
		});
	}
	signOut(): void {
		this.authService.signOut();
	}
}
