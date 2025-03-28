import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SDMButtonLink } from '@components/buttons/button-link.component';

@Component({
	selector: 'sdm-card-home',
	standalone: true,
	imports: [SDMButtonLink, CommonModule],
	templateUrl: './card-home.component.html',
	styleUrl: './card-home.component.css',
})
export class CardHomeComponent {
	@Input() headerText: string = '';
	@Input() image: string = '';
	@Input() buttonText: string = '';
	@Input() link: string = '';
	@Input() containerClass: string = '';
	@Input() imageClass: string = '';
}
