import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SDMButtonLink } from '../buttons/link/button-link.component';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../shared/auth.service';
import { User } from '../../classes/User';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [RouterLink, SDMButtonLink, CommonModule, IconComponent],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
	currentRoute: string = '';

	user: User | null = null;
	isSignIn = false;

	constructor(
		private router: Router,
		private authService: AuthService,
	) {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: any) => {
				this.currentRoute = event.url;
			});
	}

	ngOnInit(): void {
		this.authService.userTokenSubject.subscribe((userToken) => {
			if (!userToken) {
				this.isSignIn = false;
				return;
			}
			this.authService.getUser(userToken).subscribe((user) => {
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
		});

		this.authService.getToken().subscribe((userToken) => {
			if (!userToken) {
				this.isSignIn = false;
				return;
			}
			this.authService.getUser(userToken).subscribe((user) => {
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
		});
	}

	userSignOut(): void {
		this.authService.signOut();
	}
}
