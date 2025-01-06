import { Injectable } from '@angular/core';
import {
	CanActivate,
	Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { LoadingService } from '../loading/loading.service';

@Injectable({
	providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
	constructor(
		private authService: AuthenticationService,
		private loadingService: LoadingService,
		private router: Router,
	) {}

	async canActivate(
		_: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<boolean> {
		this.loadingService.register('Authentication Guard');
		try {
			if (await this.authService.validate()) {
				return true;
			}
			this.router.navigate(['/sign-in'], {
				state: { returnUrl: state.url },
			});
			return false;
		} finally {
			this.loadingService.ready('Authentication Guard');
		}
	}
}
