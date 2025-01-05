import { Component } from '@angular/core';
import { SDMAuthForm } from '../../components/authentication/auth-form.component';
import { SDMGoogleButton } from '../../components/buttons/google/google-button.component';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { SDMButtonLink } from '../../components/buttons/button-link.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../shared/services/alert/alert.service';
import { LoadingService } from '../../shared/services/loading/loading.service';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [
		SDMAuthForm,
		SDMGoogleButton,
		SDMBaseButton,
		SDMButtonLink,
		ReactiveFormsModule,
	],
	template: `
		<sdm-auth-form
			authHeader="สมัครสมาชิก"
			[formGroup]="signUpFormGroup"
			[onSubmit]="onSubmit"
		>
			<div class="flex flex-col gap-2">
				<input
					formControlName="name_first"
					type="text"
					required
					placeholder="ชื่อจริง"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="name_last"
					type="text"
					required
					placeholder="นามสกุล"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="name_nick"
					type="text"
					required
					placeholder="ชื่อเล่น"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="id"
					type="text"
					autocomplete="username"
					required
					placeholder="รหัสนักศึกษา"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="password"
					type="password"
					autocomplete="new-password"
					required
					placeholder="รหัสผ่าน"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<input
					formControlName="password_confirm"
					type="password"
					autocomplete="new-password"
					required
					placeholder="ยืนยันรหัสผ่าน"
					class="rounded-xl px-4 py-3 text-sm ring-1 ring-main-25 hover:ring-2 hover:ring-main-100 focus:outline-none focus:ring-2 focus:ring-main-100"
				/>
				<sdm-base-button
					[isSubmit]="true"
					text="สมัครสมาชิก"
					icon="user-plus"
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
				<sdm-google-button [isSignUp]="true" />
			</div>
			<div class="mt-4 flex items-center justify-center gap-3.5">
				<span class="text-center text-dark-50">
					เป็นสมาชิกอยู่แล้ว?
				</span>
				<sdm-button-link
					link="/sign-in"
					text="เข้าสู่ระบบ"
					textColorHover="text-main-100"
					[isUnderlined]="true"
				/>
			</div>
		</sdm-auth-form>
	`,
})
export class SDMPageSignUp {
	signUpFormGroup: FormGroup;

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private authService: AuthenticationService,
		private loadingService: LoadingService,
	) {
		this.signUpFormGroup = this.fb.group({
			id: [''],
			name_first: [''],
			name_last: [''],
			name_nick: [''],
			password: [''],
			password_confirm: [''],
		});
		this.onSubmit = this.onSubmit.bind(this);
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			const error = params['error'];
			if (authCode) {
				this.loadingService.register();
				this.handleGoogleCallback(authCode);
			} else if (error) {
				console.error('Google Sign-Up Callback error:', error);
				this.alertService.showAlert(
					'error',
					'ไม่สามารถสมัครสมาชิกด้วย Google ได้ กรุณาลองอีกครั้ง',
				);
				this.router.navigate(['/sign-up']);
			}
		});
	}
	handleGoogleCallback(authCode: string): void {
		this.authService
			.handleGoogleCallback(authCode, 'sign-up')
			.then(
				(response) => {
					this.authService.signIn(response.id);
					this.alertService.showAlert(
						'success',
						'สมัครสมาชิกด้วย Google สำเร็จ!',
					);
					this.router.navigate(['/']);
				},
				(error) => {
					console.error('Google Sign-Up Callback error:', error);
					this.alertService.showAlert(
						'error',
						'ไม่สามารถสมัครสมาชิกด้วย Google ได้ กรุณาลองอีกครั้ง',
					);
					this.router.navigate(['/sign-up']);
				},
			)
			.finally(() => {
				this.loadingService.ready();
			});
	}

	onSubmit() {
		if (this.signUpFormGroup.valid) {
			const backendUrl = `${environment.backendUrl}/api/auth/sign-up`;
			const formData = this.signUpFormGroup.value;

			this.loadingService.show(() => {
				this.http
					.post(backendUrl, formData)
					.pipe(
						finalize(() => {
							this.loadingService.hide();
						}),
					)
					.subscribe({
						next: (response) => {
							console.log('Sign-up successful:', response);
							this.alertService.showAlert(
								'success',
								'สมัครสมาชิกสำเร็จ!',
							);
							this.router.navigate(['/sign-in']);
						},
						error: (error) => {
							console.error('Sign-up failed:', error);
							this.alertService.showAlert(
								'error',
								'ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง',
							);
						},
					});
			});
		} else {
			this.alertService.showAlert(
				'error',
				'กรุณากรอกข้อมูลในฟอร์มให้ถูกต้อง',
			);
		}
	}
}
