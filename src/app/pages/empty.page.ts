import { Component } from '@angular/core';
import { SDMButtonLink } from '../components/buttons/link/button-link.component';

@Component({
	selector: 'sdm-page-empty',
	standalone: true,
	imports: [SDMButtonLink],
	templateUrl: './empty.page.html',
	styleUrl: './empty.page.css',
})
export class SDMPageEmpty {}
