import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { CommonModule } from '@angular/common';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';

@Component({
	selector: 'sdm-subject-review',
	standalone: true,
	imports: [IconComponent, SDMRatingComponent, CommonModule],
	templateUrl: './subject-review.component.html',
	styleUrl: './subject-review.component.css',
})
export class SDMSubjectReviewComponent {
	@Input() viewMode: 'subject-detail' | 'review' = 'subject-detail';
	@Input() subjectReviewData!: SubjectReviewData;

	public isLiked: boolean = false;

	public toggleLike() {
		this.isLiked = !this.isLiked;
	}
}
