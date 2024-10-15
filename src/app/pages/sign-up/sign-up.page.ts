import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './sign-up.page.html',
	styleUrl: './sign-up.page.css',
})
export class SDMPageSignUp {
	constructor(private http: HttpClient) {}
	googleSignUpUrl: string | null = null;

	googleSignUp() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-up`;

		this.http.get<{ data: string }>(apiUrl).subscribe((response) => {
			this.googleSignUpUrl = response.data;
			window.location.href = this.googleSignUpUrl;
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
