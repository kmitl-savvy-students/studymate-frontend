import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { CommonModule } from '@angular/common';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMWriteReviewBoxComponent } from '../write-review-box/write-review-box.component';
import { APIManagementService } from '../../shared/services/api-management.service';
import { UserToken } from '../../shared/models/UserToken.model';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User.model';

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
	@Input() currentUser: User | null = null;

	@Output() saveEditReview = new EventEmitter<void>();
	@Output() deleteUserReview = new EventEmitter<void>();

	public canEdit: boolean = false;
	public canDelete: boolean = false;
	public canLike: boolean = false;

	public isLiked: boolean = false;
	public isEditing: boolean = false;

	// public userTokenId: string | null = '';
	// public userId: string | null = '';

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}

	ngOnInit(): void {
		this.updatePermissions();
	}

	// ngAfterViewInit() {
	// 	this.authService.getToken().subscribe({
	// 		next: (userToken) => {
	// 			if (!userToken) {
	// 				return;
	// 			}
	// 			this.userTokenId = userToken.id;
	// 			this.userId = userToken.user.id;
	// 			console.log('userTokenId', this.userTokenId);
	// 			console.log('userId', this.userId);
	// 		},
	// 	});
	// }

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

	public onCancelEdit() {
		// this.toggleEdit();
		this.isEditing = false;
		console.log('isEditing : ', this.isEditing);
	}

	public onSaveEditReview() {
		this.saveEditReview.emit();
		this.toggleEdit();
	}

	public deleteReview() {
		if (this.currentUser) {
			this.apiManagementService
				.DeleteUserReviewData(
					this.subjectReviewData.teachtable_subject.subject_id,
					this.currentUser.id,
				)
				.subscribe({
					next: () => {
						console.log(
							'Review deleted successfully',

							this.subjectReviewData.teachtable_subject
								.subject_id,
							this.currentUser?.id,
						);
						this.deleteUserReview.emit();
					},
					error: (err) => {
						console.error('Error deleting review:', err);

						console.log(
							'subjectId : ',
							this.subjectReviewData.teachtable_subject
								.subject_id,
						);
						console.log('userId : ', this.currentUser?.id);
					},
				});
		}
	}
}
