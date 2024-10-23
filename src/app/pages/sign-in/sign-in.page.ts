import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { NgIf } from '@angular/common';
import { BaseResponse } from '../../classes/BaseResponse';
import { UserToken } from '../../classes/UserToken';

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
	) {}

	isSigningIn: boolean = false;

	googleSignInUrl: string | null = null;

	googleSignIn() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-in`;

		this.http.get<BaseResponse<string>>(apiUrl).subscribe((response) => {
			if (response.code !== '200') {
				console.log(response.message);
				return;
			}

			this.googleSignInUrl = response.data;
			window.location.replace(this.googleSignInUrl);
		});
	}

	googleSignInCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;

		this.http
			.post<BaseResponse<UserToken>>(apiUrl, { code: authCode })
			.subscribe((response) => {
				if (response.code !== '200') {
					console.log(response.message);
					alert(response.data);
					this.router.navigate(['/sign-in']);
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
