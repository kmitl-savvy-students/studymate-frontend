import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { initFlowbite } from 'flowbite';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { IconComponent } from '../icon/icon.component';
import { SDMConfirmDeleteModalComponent } from '../modals/delete-modal/confirm-delete-modal.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { SDMRichTextEditor } from '../rich-text-editor/rich-text-editor.component';

@Component({
	selector: 'sdm-subject-review',
	standalone: true,
	imports: [IconComponent, SDMRatingComponent, CommonModule, SDMConfirmDeleteModalComponent],
	templateUrl: './subject-review.component.html',
	styleUrl: './subject-review.component.css',
})
export class SDMSubjectReviewComponent implements OnInit, AfterViewInit {
	@ViewChild(SDMRichTextEditor) richTextEditor!: SDMRichTextEditor;
	@Input() isShowSubjectIdAndName: boolean = false;
	@Input() subjectReviewData!: SubjectReviewData;
	@Input() isSignIn: boolean = false;
	@Input() isReviewCreator: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() isLoadingReview: boolean = false;

	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() deleteUserReview = new EventEmitter<void>();
	@Output() isEditingReview = new EventEmitter<boolean>();
	@Output() createLikeReview = new EventEmitter<void>();
	@Output() deleteLikeReview = new EventEmitter<void>();

	public canEdit: boolean = false;
	public canDelete: boolean = false;

	public isLiked: boolean = false;
	public isEditing: boolean = false;
	public isAnimating: boolean = false;

	public allUsersLikedSubjectReviews: SubjectReviewData[] = [];
	public currentUserLikedSubjectReviews: SubjectReviewData[] = [];
	public isCurrentUserLiked: boolean = false;

	public reviewContent: string = '';
	public isLoadingAllUsersLikedSubjectReviews: boolean = false;
	public isLoadingUpdateReviewLike = false;

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private alertService: AlertService,
	) {}

	ngOnInit(): void {
		this.updatePermissions();
		this.reviewContent = this.subjectReviewData.review;
		this.getAllUsersLikedSubjectReviews();
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public updatePermissions() {
		this.canEdit = this.isSignIn && this.isReviewCreator;
		this.canDelete = this.isSignIn && this.isReviewCreator;
	}

	public toggleLike() {
		if (!this.isSignIn) {
			this.alertService.showAlert('warning', 'โปรดเข้าสู่ระบบเพื่อทำการกด Like รีวิว');
			return;
		}

		this.isAnimating = true;

		setTimeout(() => {
			this.isAnimating = false;
		}, 300);

		if (!this.isCurrentUserLiked) {
			this.createSubjectReviewLike();
		} else {
			this.deleteSubjectReviewLike();
		}
	}

	public onEditReview() {
		this.isEditing = true;
		this.isEditingReview.emit(this.isEditing);
		console.log('editReview() : ', this.isEditing);
	}

	public onCancelEditReview() {
		this.confirmEditReview.emit();
		this.isEditing = false;
		this.isEditingReview.emit(this.isEditing);
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
		this.isEditing = false;
		this.isEditingReview.emit(this.isEditing);
	}

	public deleteReviewData() {
		if (this.currentUser) {
			this.apiManagementService.DeleteUserReviewData(this.subjectReviewData.subject_id, this.currentUser.id).subscribe({
				next: () => {
					this.deleteUserReview.emit();
					this.alertService.showAlert('success', 'ลบรีวิวสำเร็จ');
				},
				error: (err) => {
					console.error('Error deleting review:', err);
				},
			});
		}
	}

	public createSubjectReviewLike() {
		if (this.currentUser) {
			this.isLoadingUpdateReviewLike = true;
			this.apiManagementService.CreateSubjectReviewLike(this.subjectReviewData.id).subscribe({
				next: () => {
					this.subjectReviewData.like++;
					this.isCurrentUserLiked = true;
					this.isLoadingUpdateReviewLike = false;
				},
				error: (err) => {
					this.isCurrentUserLiked = false;
					console.error('Error Like review:', err);
					this.isLoadingUpdateReviewLike = false;
				},
			});
		}
	}

	public deleteSubjectReviewLike() {
		if (this.currentUser && this.subjectReviewData.like > 0) {
			this.isLoadingUpdateReviewLike = true;
			this.apiManagementService.DeleteSubjectReviewLike(this.subjectReviewData.id).subscribe({
				next: () => {
					this.subjectReviewData.like--;
					this.isCurrentUserLiked = false;
					this.isLoadingUpdateReviewLike = false;
				},
				error: (err) => {
					this.isCurrentUserLiked = true;
					console.error('Error deleting review:', err);
					this.isLoadingUpdateReviewLike = false;
				},
			});
		}
	}

	public getAllUsersLikedSubjectReviews() {
		if (this.currentUser && this.currentUser.id) {
			this.isLoadingAllUsersLikedSubjectReviews = true;
			this.apiManagementService.GetSubjectReviewLikeByAllUser(this.subjectReviewData.id).subscribe({
				next: (res) => {
					if (res) {
						this.allUsersLikedSubjectReviews = res;

						if (!this.currentUser?.id) {
							console.warn('currentUser.id is undefined or null');
							this.isLoadingAllUsersLikedSubjectReviews = false;
							return;
						}

						this.currentUserLikedSubjectReviews = this.allUsersLikedSubjectReviews.filter((review) => review.user_id === Number(this.currentUser?.id));
						this.isCurrentUserLiked = this.currentUserLikedSubjectReviews.length > 0;
						this.isLoadingAllUsersLikedSubjectReviews = false;
					}
				},
				error: (err) => {
					console.error('Error fetching review likes:', err);
					this.isLoadingAllUsersLikedSubjectReviews = false;
				},
			});
		}
	}

	public getSubjectDetailUrl(): string {
		return this.router.serializeUrl(this.router.createUrlTree(['/subject/subject-detail', this.subjectReviewData.subject_id]));
	}
}
