import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';

@Component({
	selector: 'sdm-subject-review',
	standalone: true,
	imports: [IconComponent, SDMRatingComponent],
	templateUrl: './subject-review.component.html',
	styleUrl: './subject-review.component.css',
})
export class SDMSubjectReviewComponent {}
