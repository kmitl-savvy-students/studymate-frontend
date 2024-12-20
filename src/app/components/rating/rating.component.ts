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

	// In selector mode
	@Output() ratingChange = new EventEmitter<number>();

	onRatingChange(newRating: number): void {
		if (this.mode === 'selector') {
			this.rating = newRating;
			this.ratingChange.emit(newRating);
		}
	}

	// In selector mode : Use this code in .ts file of Parent Component that use rating component.

	// public currentRating: number = 0;

	// onRatingSelected(newRating: number): void {
	// 	console.log('User selected rating:', newRating);
	// 	this.currentRating = newRating;
	// }
}
