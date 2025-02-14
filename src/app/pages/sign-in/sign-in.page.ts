import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SDMAuthForm } from '../../components/authentication/auth-form.component';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { SDMButtonLink } from '../../components/buttons/button-link.component';
import { SDMGoogleButton } from '../../components/buttons/google/google-button.component';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { BackendService } from '../../shared/services/backend.service';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-page-sign-in',
	standalone: true,
	imports: [SDMAuthForm, SDMBaseButton, SDMGoogleButton, SDMButtonLink, ReactiveFormsModule],
	template: `
		<sdm-auth-form authHeader="เข้าสู่ระบบ" [formGroup]="signInFormGroup" [onSubmit]="onSubmit">
			<div class="flex flex-col gap-2">
				<input formControlName="id" type="text" required placeholder="รหัสนักศึกษา" autocomplete="username" class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100" />
				<input formControlName="password" type="password" autocomplete="current-password" required placeholder="รหัสผ่าน" class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100 disabled:pointer-events-none" />
				<sdm-base-button [isSubmit]="true" text="เข้าสู่ระบบ" icon="right-to-bracket" textColor="text-light" textColorHover="text-light" backgroundColor="bg-main-100" backgroundColorHover="bg-main-120" />
				<div class="my-2 flex items-center gap-5">
					<hr class="w-full text-main-25" />
					<span class="text-dark-100">หรือ</span>
					<hr class="w-full text-main-25" />
				</div>
				<sdm-google-button [isSignIn]="true" />
			</div>
			<div class="mt-4 flex items-center justify-center gap-3.5">
				<span class="text-dark-50 text-center"> ยังไม่เป็นสมาชิก? </span>
				<sdm-button-link link="/sign-up" text="สมัครสมาชิก" textColorHover="text-primary-300" [isUnderlined]="true" />
			</div>
		</sdm-auth-form>
	`,
})
export class SDMPageSignIn implements OnInit {
	signInFormGroup: FormGroup;

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private authService: AuthenticationService,
		private backendService: BackendService,
		private loadingService: LoadingService,
	) {
		this.signInFormGroup = this.fb.group({
			id: [''],
			password: [''],
		});
		this.onSubmit = this.onSubmit.bind(this);
	}

	async ngOnInit(): Promise<void> {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			const error = params['error'];
			if (authCode) {
				this.handleGoogleCallback(authCode);
			} else if (error) {
				console.error('Google Sign-In Callback error:', error);
				this.alertService.showAlert('error', 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองอีกครั้ง');
				this.router.navigate(['/sign-in']);
			}
		});
	}
	async handleGoogleCallback(authCode: string): Promise<void> {
		this.loadingService.register('Google Authentication');
		try {
			const response = await this.authService.handleGoogleCallback(authCode, 'sign-in');
			await this.authService.signIn(response.id);
			this.alertService.showAlert('success', 'เข้าสู่ระบบด้วย Google สำเร็จ!');
			this.router.navigate(['/']);
		} catch (error) {
			console.error('Google Sign-In Callback error:', error);
			this.alertService.showAlert('error', 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองอีกครั้ง');
			this.router.navigate(['/sign-in']);
		} finally {
			this.loadingService.ready('Google Authentication');
		}
	}

	onSubmit() {
		if (this.signInFormGroup.valid) {
			const backendUrl = `${this.backendService.getBackendUrl()}/api/auth/sign-in`;
			const formData = this.signInFormGroup.value;

			this.loadingService.show(() => {
				this.http
					.post(backendUrl, formData)
					.pipe(
						finalize(() => {
							this.loadingService.hide();
						}),
					)
					.subscribe({
						next: (response: any) => {
							this.authService.signIn(response.id);
							this.alertService.showAlert('success', 'เข้าสู่ระบบสำเร็จ!');
							this.router.navigate(['/']);
						},
						error: (error) => {
							const errorMessage = error?.error?.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง';
							this.alertService.showAlert('error', errorMessage);
						},
					});
			});
		} else {
			this.alertService.showAlert('error', 'กรุณากรอกข้อมูลในฟอร์มให้ครบถ้วนและถูกต้อง');
		}
	}
}
