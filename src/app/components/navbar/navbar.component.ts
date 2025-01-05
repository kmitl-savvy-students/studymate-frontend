import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { StudyMateLogo } from '../logo/studymate-logo.component';
import { SDMButtonNav } from './navbar-button.component';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [
		RouterLink,
		CommonModule,
		IconComponent,
		StudyMateLogo,
		SDMButtonNav,
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
