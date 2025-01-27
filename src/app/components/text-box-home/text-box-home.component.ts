import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-text-box-home',
	standalone: true,
	imports: [],
	templateUrl: './text-box-home.component.html',
	styleUrl: './text-box-home.component.css',
})
export class TextBoxHomeComponent {
	@Input() headerText: string = '';
	@Input() listText: string[] = [];
}
