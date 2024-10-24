import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { BaseResponse } from '../../classes/BaseResponse';
import { UserToken } from '../../classes/UserToken';
import { NgIf } from '@angular/common';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [RouterLink, ReactiveFormsModule, NgIf],
	templateUrl: './sign-up.page.html',
	styleUrl: './sign-up.page.css',
})
export class SDMPageSignUp implements OnInit {
	constructor(
		private http: HttpClient,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
	) {}

	isSigningUp: boolean = false;

	googleSignUpUrl: string | null = null;

	googleSignUp() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-up`;

		this.http.get<BaseResponse<string>>(apiUrl).subscribe((response) => {
			if (response.code !== '200') {
				console.log(response.message);
				return;
			}

			this.googleSignUpUrl = response.data;
			window.location.replace(this.googleSignUpUrl);
		});
	}

	googleSignUpCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;

		this.http
			.post<
				BaseResponse<UserToken>
			>(apiUrl, { code: authCode, redirect_uri: 'sign-up' })
			.subscribe((response) => {
				if (response.code !== '200') {
					console.log(response.message);
					alert(response.data);
					this.router.navigate(['/sign-up']);
					return;
				}

				this.authService.signIn(response.data);
				this.router.navigate(['/']);
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
