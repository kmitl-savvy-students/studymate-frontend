import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { CommonModule } from '@angular/common';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMWriteReviewBoxComponent } from '../write-review-box/write-review-box.component';

@Component({
	selector: 'sdm-subject-review',
	standalone: true,
	imports: [
		IconComponent,
		SDMRatingComponent,
		CommonModule,
		SDMWriteReviewBoxComponent,
	],
	templateUrl: './subject-review.component.html',
	styleUrl: './subject-review.component.css',
})
export class SDMSubjectReviewComponent implements OnInit {
	@Input() viewMode: 'subject-detail' | 'review' = 'subject-detail';
	@Input() subjectReviewData!: SubjectReviewData;
	@Input() isSignIn: boolean = false;
	@Input() isReviewCreator: boolean = false;

	public canEdit: boolean = false;
	public canDelete: boolean = false;
	public canLike: boolean = false;

	public isLiked: boolean = false;
	public isEditing: boolean = false;

	ngOnInit(): void {
		this.updatePermissions();
	}

	public updatePermissions() {
		this.canEdit = this.isSignIn && this.isReviewCreator;
		this.canDelete = this.isSignIn && this.isReviewCreator;
		this.canLike = this.isSignIn;
	}

	public toggleLike() {
		if (!this.canLike) {
			alert('Please log in to like this review.');
			return;
		}
		this.isLiked = !this.isLiked;
	}

	public toggleEdit() {
		this.isEditing = !this.isEditing;
	}
}
