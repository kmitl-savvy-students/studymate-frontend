import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SDMButtonGoogle } from '../../components/buttons/google/button-google.component';

@Component({
	selector: 'sdm-page-sign-up',
	standalone: true,
	imports: [RouterLink, SDMButtonGoogle],
	templateUrl: './sign-up.page.html',
	styleUrl: './sign-up.page.css',
})
export class SDMPageSignUp {}
