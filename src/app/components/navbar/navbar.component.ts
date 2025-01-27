import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { StudyMateLogo } from '../logo/studymate-logo.component';
import { SDMButtonNav } from './navbar-button.component';
import { SDMButtonLink } from '../buttons/button-link.component';
import { SDMAvatarDropdownNav } from './navbar-avatar-dropdown';
import { User } from '../../shared/models/User.model';

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
})
export class NavbarComponent implements OnInit {
	signedIn: boolean = false;
	currentUser: User | null = null;

	constructor(private authService: AuthenticationService) {}

	ngOnInit(): void {
		this.authService.signedIn$.subscribe((signedIn) => {
			this.signedIn = signedIn;
		});
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
	}
}
