import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SDMBaseButton } from '../base-button.component';
import { SDMGoogleIconSVG } from './google-svg.component';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../../shared/services/alert/alert.service';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { BackendService } from '../../../shared/services/backend.service';

@Component({
	selector: 'sdm-google-button',
	standalone: true,
	template: `
		<sdm-base-button
			*ngIf="isSignIn"
			[iconCustom]="customIconTemplate"
			text="เข้าสู่ระบบด้วย Google"
			backgroundColor="bg-main-5"
			backgroundColorHover="bg-main-10"
			(clickEvent)="googleSignIn()"
		/>
		<sdm-base-button
			*ngIf="isSignUp"
			[iconCustom]="customIconTemplate"
			text="สมัครสมาชิกด้วย Google"
			backgroundColor="bg-main-5"
			backgroundColorHover="bg-main-10"
			(clickEvent)="googleSignIn()"
		/>

		<ng-template #customIconTemplate>
			<sdm-google-icon-svg />
		</ng-template>
	`,
	imports: [CommonModule, SDMBaseButton, SDMGoogleIconSVG],
})
export class SDMGoogleButton {
	@Input() isSignIn: boolean = false;
	@Input() isSignUp: boolean = false;

	constructor(
		private http: HttpClient,
		private alertService: AlertService,
		private loadingService: LoadingService,
		private backendService: BackendService,
	) {}

	googleSignIn(): void {
		const googleSignInUrl = `${this.backendService.getBackendUrl()}/api/google/link/sign-in`;
		const googleSignUpUrl = `${this.backendService.getBackendUrl()}/api/google/link/sign-up`;

		const apiUrl = this.isSignIn ? googleSignInUrl : googleSignUpUrl;

		this.loadingService.show(() => {
			this.http.get<{ href: string }>(apiUrl).subscribe({
				next: (res) => {
					if (res.href) {
						window.location.replace(res.href);
					} else {
						this.alertService.showAlert(
							'error',
							'Google Sign-In URL is missing.',
						);
						this.loadingService.hide();
					}
				},
				error: (error) => {
					console.error('Google Sign-In error:', error);
					this.alertService.showAlert(
						'error',
						'ไม่สามารถเข้าสู่ระบบด้วย Google ได้',
					);
					this.loadingService.hide();
				},
			});
		});
	}
}
