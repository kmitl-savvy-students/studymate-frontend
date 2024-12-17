import { Curriculum } from '../../shared/models/Curriculum.model';
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
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User.model';
import { of, Subject } from 'rxjs';
import { UserToken } from '../../shared/models/UserToken.model';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [RouterLink, SDMButtonLink, CommonModule, IconComponent],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
	public currentRoute: string = '';
	public user: User | null = null;
	public isSignIn: boolean = false;
	public fromNavbar: string = 'navbar';
	public isDropdownOpen = false;

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
			)
			.subscribe((userToken) => {
				let user = userToken.user;
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
	}

	public closeDropdown() {
		const dropdown = document.getElementById('dropdownAvatar');
		if (dropdown) {
			dropdown.classList.add('hidden');
		}
	}

	userSignOut(): void {
		this.authService.signOut();
	}
}
