import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OtpRequest } from '@models/OtpData.model';
import { APIManagementService } from '@services/api-management.service';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SDMAuthForm } from '../../components/authentication/auth-form.component';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { SDMButtonLink } from '../../components/buttons/button-link.component';
import { SDMGoogleButton } from '../../components/buttons/google/google-button.component';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [SDMAuthForm, SDMGoogleButton, SDMBaseButton, SDMButtonLink, ReactiveFormsModule, CommonModule],
	templateUrl: './sign-up.page.html',
})
export class SDMPageSignUp {
	public otpData!: OtpRequest;
	public isLoading = false;
	public isRequestOTP: boolean = false;
	public isVerifyOTP: boolean = false;
	public otpCountdown: number = 0;
	public isOtpButtonDisabled: boolean = false;
	public latestOtpReferer: string = '';
	public isStrongPassword: boolean = true;
	public isDisabledOtpZone: boolean = false;
	private countdownInterval: any;

	signUpFormGroup: FormGroup;

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private authService: AuthenticationService,
		private loadingService: LoadingService,
		private apiManagementService: APIManagementService,
	) {
		this.signUpFormGroup = this.fb.group({
			id: ['', [Validators.required, Validators.minLength(8), Validators.minLength(8)]],
			name_first: ['', Validators.required],
			name_last: ['', Validators.required],
			name_nick: ['', Validators.required],
			password: ['', Validators.required],
			password_confirm: ['', Validators.required],
			otp_code: [''],
		});
		this.onSubmit = this.onSubmit.bind(this);
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			const error = params['error'];
			if (authCode) {
				this.handleGoogleCallback(authCode);
			} else if (error) {
				console.error('Google Sign-Up Callback error:', error);
				this.alertService.showAlert('error', 'ไม่สามารถสมัครสมาชิกด้วย Google ได้ กรุณาลองอีกครั้ง');
				this.router.navigate(['/sign-up']);
			}
		});
		this.signUpFormGroup.valueChanges.subscribe(() => {
			this.isDisabledOtp();
		});
		this.isDisabledOtp();
	}

	handleGoogleCallback(authCode: string): void {
		this.loadingService.register('Google Authentication');
		this.authService
			.handleGoogleCallback(authCode, 'sign-up')
			.then(
				(response) => {
					this.authService.signIn(response.id);
					this.alertService.showAlert('success', 'สมัครสมาชิกด้วย Google สำเร็จ!');
					this.router.navigate(['/']);
				},
				(error) => {
					console.error('Google Sign-Up Callback error:', error);
					this.alertService.showAlert('error', 'ไม่สามารถสมัครสมาชิกด้วย Google ได้ กรุณาลองอีกครั้ง');
					this.router.navigate(['/sign-up']);
				},
			)
			.finally(() => {
				this.loadingService.ready('Google Authentication');
			});
	}

	onSubmit() {
		if (this.signUpFormGroup.valid) {
			const backendUrl = `${environment.backendUrl}/api/auth/sign-up`;
			const formData = this.signUpFormGroup.value;

			const dataToSubmit = {
				id: formData.id,
				password: formData.password,
				password_confirm: formData.password_confirm,
				name_nick: formData.name_nick,
				name_first: formData.name_first,
				name_last: formData.name_last,
				otp_id: this.otpData.id,
			};
			this.loadingService.show(() => {
				this.http
					.post(backendUrl, dataToSubmit)
					.pipe(
						finalize(() => {
							this.loadingService.hide();
						}),
					)
					.subscribe({
						next: (_) => {
							this.alertService.showAlert('success', 'สมัครสมาชิกสำเร็จ!');
							this.router.navigate(['/sign-in']);
						},
						error: (error) => {
							const errorMessage = error?.error?.message ?? 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง';
							this.alertService.showAlert('error', errorMessage);
							if (errorMessage) {
								if (errorMessage === 'รหัสผ่านไม่แข็งแรงพอ') {
									this.isStrongPassword = false;
								}
							}
						},
					});
			});
		} else {
			this.alertService.showAlert('error', 'กรุณากรอกข้อมูลในฟอร์มให้ครบถ้วนและถูกต้อง');
		}
	}

	public isDisabledOtp() {
		if (
			this.signUpFormGroup.get('name_first')?.valid &&
			this.signUpFormGroup.get('name_last')?.valid &&
			this.signUpFormGroup.get('name_nick')?.valid &&
			this.signUpFormGroup.get('password')?.valid &&
			this.signUpFormGroup.get('password_confirm')?.valid
		) {
			this.isDisabledOtpZone = false;
			this.signUpFormGroup.get('id')?.enable({ onlySelf: true });
		} else {
			this.isDisabledOtpZone = true;
			this.signUpFormGroup.get('id')?.disable({ onlySelf: true });
		}
	}

	public requestOTP() {
		if ((this.signUpFormGroup.get('id')?.invalid ?? false) || this.signUpFormGroup.get('id')?.value?.length !== 8) {
			this.alertService.showAlert('error', 'กรุณากรอกรหัสนักศึกษาให้ถูกต้อง');
			return;
		}
		this.getOtpData();
	}

	public verifyOTP() {
		if (this.signUpFormGroup.get('otp_code')?.invalid ?? false) {
			this.alertService.showAlert('error', 'กรุณากรอกรหัส OTP');
			return;
		}
		this.getOtpVerify();
	}

	public getOtpData() {
		this.isLoading = true;

		this.apiManagementService.GetOtpData(this.signUpFormGroup.value.id).subscribe({
			next: (res) => {
				if (res) {
					this.otpData = res;
					this.alertService.showAlert('success', 'ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ');
					this.isOtpButtonDisabled = true;
					if (this.otpData) {
						this.latestOtpReferer = this.otpData.referer;
					}
					this.isLoading = false;
					if (this.isOtpButtonDisabled) {
						this.otpCountdown = 60;
						this.countdownInterval = setInterval(() => {
							this.otpCountdown--;
							if (this.otpCountdown <= 0) {
								clearInterval(this.countdownInterval);
								this.isOtpButtonDisabled = false;
							}
						}, 1000);
						this.isRequestOTP = true;
					}
				}
			},
			error: (error) => {
				const errorMessage = error?.error?.message ?? 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง';
				this.alertService.showAlert('error', errorMessage);

				clearInterval(this.countdownInterval);
				this.isOtpButtonDisabled = false;
				this.isLoading = false;
			},
		});
	}

	public getOtpVerify() {
		this.apiManagementService.GetOtpVerify(this.otpData.id, this.signUpFormGroup.value.otp_code).subscribe({
			next: (res) => {
				if (res) {
					this.isVerifyOTP = true;
					this.signUpFormGroup.get('id')?.disable({ onlySelf: true });
					this.alertService.showAlert('success', 'ยืนยันรหัส OTP สำเร็จ!');
					clearInterval(this.countdownInterval);
				}
			},
			error: (error) => {
				const errorMessage = error?.error?.message ?? 'ไม่สามารถยืนยัน OTP ได้ กรุณาลองใหม่อีกครั้ง';
				this.alertService.showAlert('error', errorMessage);
				clearInterval(this.countdownInterval);
				this.isOtpButtonDisabled = false;
			},
		});
	}
}
