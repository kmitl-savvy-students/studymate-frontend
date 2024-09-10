import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'sdm-page-sign-in',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './sign-in.page.html',
	styleUrl: './sign-in.page.css',
})
export class SDMPageSignIn {}
