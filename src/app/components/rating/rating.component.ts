import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-rating',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './rating.component.html',
	styleUrl: './rating.component.css',
})
export class SDMRatingComponent {
	@Input() mode: 'display' | 'selector' = 'display';
	@Input() rating: number = 0;
	@Input() customClass: string = '';

	onRatingChange(newRating: number): void {
		if (this.mode === 'selector') {
			this.rating = newRating;
		}
	}
}
