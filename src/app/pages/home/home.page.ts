import { Component } from '@angular/core';
import { SDMButtonLink } from '../../components/buttons/link/button-link.component';

@Component({
	selector: 'sdm-page-home',
	standalone: true,
	imports: [SDMButtonLink],
	templateUrl: './home.page.html',
	styleUrl: './home.page.css',
})
export class SDMPageHome {}
