import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Otp } from '@models/OtpData.model';
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
import { OtpDataMockUp } from './sign-up-data';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [SDMAuthForm, SDMGoogleButton, SDMBaseButton, SDMButtonLink, ReactiveFormsModule, CommonModule],
	templateUrl: './sign-up.page.html',
})
export class SDMPageSignUp {
	public otpData?: Otp;
	public otpDataMockUp = OtpDataMockUp;
	public isRequestOTP: boolean = false;
	public isVerifyOTP: boolean = false;
	public otpCountdown: number = 0;
	public isOtpButtonDisabled: boolean = false;
	public latestOtpReferer: string = '';
	public isStrongPassword: boolean = true;
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
			id: [''],
			name_first: [''],
			name_last: [''],
			name_nick: [''],
			password: [''],
			password_confirm: [''],
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
		console.log('test', this.signUpFormGroup.get('id')?.invalid);
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

			this.loadingService.show(() => {
				this.http
					.post(backendUrl, formData)
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
							const errorMessage = error?.error?.message || 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง';
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

	public requestOTP() {
		if ((this.signUpFormGroup.get('id')?.invalid ?? false) || this.signUpFormGroup.get('id')?.value?.length !== 8) {
			this.alertService.showAlert('error', 'กรุณากรอกรหัสนักศึกษาให้ถูกต้อง');
			return;
		}
		this.getOtpData();
		if (this.isOtpButtonDisabled) {
			this.otpCountdown = 10;
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

	public verifyOTP() {
		if (this.signUpFormGroup.get('otp_code')?.invalid ?? false) {
			this.alertService.showAlert('error', 'กรุณากรอกรหัส OTP');
			return;
		}
		this.isVerifyOTP = true;
		this.signUpFormGroup.get('id')?.disable({ onlySelf: true }); //disabled แค่ UI แต่ยังส่งค่าของ input นี้ไปด้วยเหมือนเดิม
		this.alertService.showAlert('success', 'ยืนยันรหัส OTP สำเร็จ!');
		clearInterval(this.countdownInterval);
	}

	public getOtpData() {
		console.log('getOtpData');
		this.isOtpButtonDisabled = true;
		this.latestOtpReferer = this.otpDataMockUp[this.otpDataMockUp.length - 1].referer;

		// ถ้ามี API GetOtpData จะใช้โค้ดด้านล่างนี้

		// this.apiManagementService.GetOtpData(this.signUpFormGroup.value.id).subscribe({
		// 	next: (res) => {
		// 		if (res) {
		// 			this.otpData = res;
		// 			this.alertService.showAlert('success', 'OTP ได้ถูกส่งไปยังอีเมลของคุณแล้ว');
		// 			this.isOtpButtonDisabled = true;
		// 		}
		// 	},
		// 	error: (error) => {
		// 		console.error('An unexpected error occurred:', error.status);
		// 		this.alertService.showAlert('error', 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่');
		// 		clearInterval(this.countdownInterval);
		// 		this.isOtpButtonDisabled = false;
		// 	},
		// });
	}
}
