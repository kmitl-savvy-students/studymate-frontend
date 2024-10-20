import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { NgIf } from '@angular/common';

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

		this.http.get<{ data: string }>(apiUrl).subscribe((response) => {
			this.googleSignInUrl = response.data;
			window.location.href = this.googleSignInUrl;
		});
	}

	googleSignInCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;

		this.http
			.post<{ data: { id: string } }>(apiUrl, { code: authCode })
			.subscribe((response) => {
				this.authService.setToken(response.data.id);
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
