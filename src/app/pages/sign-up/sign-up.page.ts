import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { NgIf } from '@angular/common';
import { APIManagementService } from '../../shared/api-manage/api-management.service';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [RouterLink, ReactiveFormsModule, NgIf],
	templateUrl: './sign-up.page.html',
	styleUrl: './sign-up.page.css',
})
export class SDMPageSignUp implements OnInit {
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private apiManagementService: APIManagementService,
	) {}

	isSigningUp: boolean = false;

	googleSignUpUrl: string | null = null;

	googleSignUp() {
		this.apiManagementService.GetUserOauthSignup().subscribe({
			next: (res) => {
				console.log(res);
				if (res.href !== undefined) {
					this.googleSignUpUrl = res.href;
					window.location.replace(this.googleSignUpUrl);
				}
			},
			error: (error) => {
				console.log(error);
				if (error.status === 404) {
					console.error('Not found');
				} else if (error.status === 500) {
					console.error('Internal Server Error');
				} else {
					console.error(
						'An unexpected error occurred:',
						error.status,
					);
				}
			},
		});
	}

	googleSignUpCallback(authCode: string) {
		this.apiManagementService
			.UpdateUserOauthSignupCallback(authCode)
			.subscribe({
				next: (res) => {
					this.authService.signIn(res);
					this.router.navigate(['/']);
				},
				error: (error) => {
					if (error.status === 409) {
						alert(error.error.message);
						this.router.navigate(['/sign-in']);
						return;
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}
				},
			});
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			if (authCode) {
				this.isSigningUp = true;
				this.googleSignUpCallback(authCode);
			}
		});
	}

	myForm = new FormGroup({
		firstname: new FormControl(''),
		lastname: new FormControl(''),
		email: new FormControl(''),
		password: new FormControl(''),
		passwordConfirm: new FormControl(''),
	});

	onSubmit() {
		console.log(this.myForm.value);
	}
}
