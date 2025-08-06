import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-pic-box-home',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './pic-box-home.component.html',
	styleUrl: './pic-box-home.component.css',
})
export class PicBoxHomeComponent {
	@Input() image: string = '';
	@Input() padding: string = 'p-10';
	@Input() containerClass: string = 'p-10';
}
