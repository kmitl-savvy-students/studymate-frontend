import { Component } from '@angular/core';
import { SDMAuthForm } from '../../components/authentication/auth-form.component';
import { SDMGoogleButton } from '../../components/buttons/google/google-button.component';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { SDMButtonLink } from '../../components/buttons/button-link.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
	selector: 'sdm-page-sign-in',
	standalone: true,
	imports: [
		SDMAuthForm,
		SDMBaseButton,
		SDMGoogleButton,
		SDMButtonLink,
		ReactiveFormsModule,
	],
	template: `
		<sdm-auth-form
			authHeader="เข้าสู่ระบบ"
			[formGroup]="signInFormGroup"
			[onSubmit]="onSubmit"
		>
			<div class="flex flex-col gap-2">
				<input
					formControlName="id"
					type="text"
					required
					placeholder="รหัสนักศึกษา"
					autocomplete="username"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="password"
					type="password"
					autocomplete="current-password"
					required
					placeholder="รหัสผ่าน"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100 disabled:pointer-events-none"
				/>
				<sdm-base-button
					[isSubmit]="true"
					[IsDisabled]="this.loading"
					[text]="this.loading ? 'กำลังส่งข้อมูล...' : 'เข้าสู่ระบบ'"
					icon="right-to-bracket"
					textColor="text-white"
					textColorHover="text-white"
					backgroundColor="bg-main-100"
					backgroundColorHover="bg-main-120"
				/>
				<div class="my-2 flex items-center gap-5">
					<hr class="w-full text-main-25" />
					<span class="text-dark-100">หรือ</span>
					<hr class="w-full text-main-25" />
				</div>
				<sdm-google-button [isSignIn]="true" />
			</div>
			<div class="mt-4 flex items-center justify-center gap-3.5">
				<span class="text-center text-dark-50">
					ยังไม่เป็นสมาชิก?
				</span>
				<sdm-button-link
					link="/sign-up"
					icon="user-plus"
					text="สมัครสมาชิก"
				/>
			</div>
		</sdm-auth-form>
	`,
})
export class SDMPageSignIn {
	signInFormGroup: FormGroup;

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router,
		private alertService: AlertService,
		private authService: AuthenticationService,
	) {
		this.signInFormGroup = this.fb.group({
			id: [''],
			password: [''],
		});
		this.onSubmit = this.onSubmit.bind(this);
	}

	loading: boolean = false;
	onSubmit() {
		if (this.signInFormGroup.valid) {
			const backendUrl = `${environment.backendUrl}/api/auth/sign-in`;
			const formData = this.signInFormGroup.value;

			this.loading = true;
			this.http.post(backendUrl, formData).subscribe({
				next: (response: any) => {
					this.loading = false;

					this.authService.setToken(response.id);
					this.alertService.showAlert(
						'success',
						'เข้าสู่ระบบสำเร็จ!',
					);
					this.router.navigate(['/']);
				},
				error: (error) => {
					this.loading = false;

					console.error('Sign-in failed:', error);
					this.alertService.showAlert(
						'error',
						'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง',
					);
				},
			});
		} else {
			this.alertService.showAlert(
				'error',
				'กรุณากรอกข้อมูลในฟอร์มให้ถูกต้อง',
			);
		}
	}
}
