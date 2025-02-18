import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SDMButtonLink } from '@components/buttons/button-link.component';
import { StudyMateLogo } from '@components/logo/studymate-logo.component';
import { User } from '@models/User.model';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { SDMAvatarDropdownNav } from './navbar-avatar-dropdown';
import { SDMButtonNav } from './navbar-button.component';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [CommonModule, StudyMateLogo, SDMButtonNav, SDMButtonLink, SDMAvatarDropdownNav],
	templateUrl: 'navbar.component.html',
	styleUrl: 'navbar.component.css',
})
export class NavbarComponent implements OnInit {
	constructor(private authService: AuthenticationService) {}

	signedIn: boolean = false;
	currentUser: User | null = null;

	ngOnInit(): void {
		this.authService.signedIn$.subscribe((signedIn) => {
			this.signedIn = signedIn;
		});
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
	}
}
