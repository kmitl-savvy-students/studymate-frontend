import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SDMButtonLink } from '../buttons/link/button-link.component';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../shared/auth.service';

@Component({
	selector: 'sdm-navbar',
	standalone: true,
	imports: [RouterLink, SDMButtonLink, CommonModule, IconComponent],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
	currentRoute: string = '';
	isSetToken = false;

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
		this.authService.tokenSubject.subscribe((token) => {
			this.isSetToken = token !== null;
			console.log('Token:', token);
			console.log('isSetToken:', this.isSetToken);
		});
		this.isSetToken = this.authService.getToken() !== null;
	}
}
