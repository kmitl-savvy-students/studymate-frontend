import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { NgIf } from '@angular/common';
import { APIManagementService } from '../../shared/api-manage/api-management.service';

@Component({
	selector: 'sdm-page-sign-in',
	standalone: true,
	imports: [RouterLink, ReactiveFormsModule, NgIf],
	templateUrl: './sign-in.page.html',
	styleUrl: './sign-in.page.css',
})
export class SDMPageSignIn implements OnInit {
	constructor(
		private http: HttpClient,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private apiManagementService: APIManagementService,
	) {}

	isSigningIn: boolean = false;

	googleSignInUrl: string | null = null;

	googleSignIn() {
		this.apiManagementService.GetUserOauthSignin().subscribe({
			next: (res) => {
				console.log(res);
				if (res.href !== undefined) {
					this.googleSignInUrl = res.href;
					window.location.replace(this.googleSignInUrl);
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

	googleSignInCallback(authCode: string) {
		this.apiManagementService
			.UpdateUserOauthSigninCallback(authCode)
			.subscribe({
				next: (res) => {
					this.authService.signIn(res);
					this.router.navigate(['/']);
				},
				error: (error) => {
					if (error.status === 404) {
						alert(error.error.message);
						this.router.navigate(['/sign-up']);
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

	// googleSignIn() {
	// 	const apiUrl = `${environment.backendUrl}/api/google/link/sign-in`;

	// 	this.http.get<BaseResponse<string>>(apiUrl).subscribe((response) => {
	// 		if (response.code !== '200') {
	// 			console.log(response.message);
	// 			return;
	// 		}

	// 		this.googleSignInUrl = response.data;
	// 		window.location.replace(this.googleSignInUrl);
	// 	});
	// }

	// googleSignInCallback(authCode: string) {
	// 	const apiUrl = `${environment.backendUrl}/api/google/callback`;

	// 	this.http
	// 		.post<
	// 			BaseResponse<UserToken>
	// 		>(apiUrl, { Code: authCode, RedirectUri: 'sign-in' })
	// 		.subscribe((response) => {
	// 			if (response.code !== '200') {
	// 				console.log(response.message);
	// 				alert(response.data);
	// 				response.message === 'UNAUTHORIZED'
	// 					? this.router.navigate(['/sign-up'])
	// 					: this.router.navigate(['/sign-in']);
	// 				return;
	// 			}
	// 			this.authService.signIn(response.data);
	// 			this.router.navigate(['/']);
	// 		});
	// }

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			if (authCode) {
				this.isSigningIn = true;
				this.googleSignInCallback(authCode);
			}
		});
	}

	myForm = new FormGroup({
		email: new FormControl(''),
		password: new FormControl(''),
	});

	onSubmit() {
		console.log(this.myForm.value);
	}
}
