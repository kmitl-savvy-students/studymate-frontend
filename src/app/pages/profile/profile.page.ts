import { AfterViewInit, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { IconComponent } from '../../components/icon/icon.component';
import { AuthService } from '../../shared/services/auth.service.js';
import { User } from '../../shared/models/User.model.js';
import { UserToken } from '../../shared/models/UserToken.model.js';
import { Router, NavigationEnd } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'sdm-page-profile',
	standalone: true,
	imports: [IconComponent],
	templateUrl: './profile.page.html',
	styleUrl: './profile.page.css',
})
export class SDMPageProfile implements AfterViewInit {
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

	ngAfterViewInit(): void {
		initFlowbite();
	}
}
