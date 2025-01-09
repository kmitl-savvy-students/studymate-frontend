import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { CommonModule } from '@angular/common';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMWriteReviewBoxComponent } from '../write-review-box/write-review-box.component';
import { APIManagementService } from '../../shared/services/api-management.service';
import { User } from '../../shared/models/User.model';
import { AlertService } from '../../shared/services/alert/alert.service';
import { SDMRichTextEditor } from '../rich-text-editor/rich-text-editor.component';
import { SDMConfirmDeleteModalComponent } from '../modals/delete-modal/confirm-delete-modal.component';

@Component({
	selector: 'sdm-subject-review',
	standalone: true,
	imports: [
		IconComponent,
		SDMRatingComponent,
		CommonModule,
		SDMWriteReviewBoxComponent,
		SDMConfirmDeleteModalComponent,
	],
	templateUrl: './subject-review.component.html',
	styleUrl: './subject-review.component.css',
})
export class SDMSubjectReviewComponent implements OnInit {
	@ViewChild(SDMRichTextEditor) richTextEditor!: SDMRichTextEditor;
	@Input() viewMode: 'subject-detail' | 'review' = 'subject-detail';
	@Input() subjectReviewData!: SubjectReviewData;
	@Input() isSignIn: boolean = false;
	@Input() isReviewCreator: boolean = false;
	@Input() currentUser: User | null = null;

	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() deleteUserReview = new EventEmitter<void>();

	public canEdit: boolean = false;
	public canDelete: boolean = false;
	public canLike: boolean = false;

	public isLiked: boolean = false;
	public isEditing: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private alertService: AlertService,
	) {}

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
		console.log(
			'isEditing toggled from subject-review component:',
			this.isEditing,
		);
	}

	public onCancelEditReview() {
		this.toggleEdit();
		console.log('Editing canceled. isEditing:', this.isEditing);
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
		this.toggleEdit();
	}

	public deleteReviewData() {
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
						this.alertService.showAlert('success', 'ลบรีวิวสำเร็จ');
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
