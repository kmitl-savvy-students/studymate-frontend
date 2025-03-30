import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@services/authentication/authentication.service';

@Injectable({
	providedIn: 'root',
})
export class AdminGuard implements CanActivate {
	constructor(
		private authService: AuthenticationService,
		private router: Router,
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (this.authService?.currentUser?.is_admin) {
			return true;
		} else {
			this.router.navigate(['/home']);
			return false;
		}
	}
}
