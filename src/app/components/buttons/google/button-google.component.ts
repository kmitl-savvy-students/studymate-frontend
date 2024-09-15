import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'sdm-button-google',
	standalone: true,
	templateUrl: './button-google.component.html',
	styleUrls: ['./button-google.component.css'],
})
export class SDMButtonGoogle implements OnInit {
	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		(window as any).handleCredentialResponse = (response: any) => {
			this.handleGoogleSignIn(response.credential);
		};
	}

	handleGoogleSignIn(googleToken: string): void {
		const apiUrl = `http://localhost:5000/api/google`;

		this.http.post(apiUrl, { googleToken }).subscribe({
			next: (response) => {
				console.log('Sign-in success:', response);
			},
			error: (error) => {
				console.error('Sign-in error:', error);
			},
		});
	}
}
