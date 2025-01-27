import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-card-home',
	standalone: true,
	imports: [],
	templateUrl: './card-home.component.html',
	styleUrl: './card-home.component.css',
})
export class CardHomeComponent {
	@Input() headerText: string = '';
	@Input() image: string = '';
	@Input() buttonText: string = '';
}
