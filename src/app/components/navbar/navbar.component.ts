import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import {
	catchError,
	distinctUntilChanged,
	filter,
	switchMap,
	takeUntil,
} from 'rxjs/operators';
import { SDMButtonLink } from '../buttons/link/button-link.component';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../shared/auth.service';
import { User } from '../../shared/api-manage/models/User';
import { of, Subject } from 'rxjs';
import { UserToken } from '../../shared/api-manage/models/UserToken';

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

	public userTokenSubject: Subject<UserToken | null> =
		new Subject<UserToken | null>();

	ngOnInit(): void {
		this.authService.userTokenSubject
			.pipe(
				filter((token) => token !== null),
				distinctUntilChanged(),
				switchMap((userToken) => this.authService.getUser(userToken!)),
			)
			.subscribe((user) => {
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
	}

	userSignOut(): void {
		this.authService.signOut();
	}
}
