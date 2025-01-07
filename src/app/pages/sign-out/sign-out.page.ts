import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-page-sign-out',
	standalone: true,
	imports: [],
	template: ` <span>กำลังออกจากระบบ...</span> `,
})
export class SDMPageSignOut implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {}
	ngOnInit(): void {
		this.loadingService.show(() => {
			this.authService.signOut();
			this.alertService.showAlert('success', 'ออกจากระบบสำเร็จ!');
			this.router.navigate(['/home']);
			this.loadingService.hide();
		});
	}
}
