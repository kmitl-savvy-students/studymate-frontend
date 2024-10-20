import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';

@Component({
	selector: 'sdm-page-sign-in',
	standalone: true,
	imports: [RouterLink, ReactiveFormsModule],
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

	googleSignInUrl: string | null = null;
	googleSignIn() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-in`;

		this.http.get<{ data: string }>(apiUrl).subscribe((response) => {
			this.googleSignInUrl = response.data;
			window.location.replace(this.googleSignInUrl); // เปลี่ยนเป็น replace
		});
	}
	googleSignInCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;

		this.http
			.post<{ data: { id: string } }>(apiUrl, { code: authCode })
			.subscribe((response) => {
				this.authService.setToken(response.data.id);
				console.log(response.data.id);
				console.log('Token Set: ', this.authService.getToken());

				// ใช้ router.navigate แทน window.location.href
				this.router.navigate(['/']);
			});
	}

	// ngOnInit() {
	// 	this.route.queryParams.subscribe((params) => {
	// 		const authCode = params['code'];
	// 		if (authCode) this.googleSignInCallback(authCode);
	// 	});
	// }

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			const authCode = params['code'];
			if (authCode) {
				this.googleSignInCallback(authCode);

				// ล้าง query parameters เพื่อไม่ให้ authCode ค้างอยู่ใน URL
				this.router.navigate([], {
					relativeTo: this.route,
					queryParams: {},
					replaceUrl: true, // แทนที่ URL โดยไม่โหลดหน้าใหม่
				});
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
