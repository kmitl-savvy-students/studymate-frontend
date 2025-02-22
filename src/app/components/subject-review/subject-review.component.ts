import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationService } from '@services/authentication/authentication.service';
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

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthenticationService,
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

		this.isCurrentUserLiked = !this.isCurrentUserLiked;
		if (this.isCurrentUserLiked) {
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
			this.apiManagementService.CreateSubjectReviewLike(this.subjectReviewData.id).subscribe({
				next: () => {
					this.subjectReviewData.like++;
				},
				error: (err) => {
					this.isCurrentUserLiked = false;
					console.error('Error Like review:', err);
				},
			});
		}
	}

	public deleteSubjectReviewLike() {
		if (this.currentUser) {
			this.apiManagementService.DeleteSubjectReviewLike(this.subjectReviewData.id).subscribe({
				next: () => {
					this.subjectReviewData.like--;
				},
				error: (err) => {
					this.isCurrentUserLiked = true;
					console.error('Error deleting review:', err);
				},
			});
		}
	}

	public getAllUsersLikedSubjectReviews() {
		this.isLoadingAllUsersLikedSubjectReviews = true;
		if (this.currentUser && this.currentUser.id) {
			this.apiManagementService.GetSubjectReviewLikeByAllUser(this.subjectReviewData.id).subscribe({
				next: (res) => {
					if (res) {
						this.allUsersLikedSubjectReviews = res;

						if (!this.currentUser?.id) {
							console.warn('currentUser.id is undefined or null');
							return;
						}

						this.currentUserLikedSubjectReviews = this.allUsersLikedSubjectReviews.filter((review) => review.user_id === this.currentUser?.id.toString());

						this.isCurrentUserLiked = this.currentUserLikedSubjectReviews.length > 0;
						this.isLoadingAllUsersLikedSubjectReviews = false;
					}
				},
				error: (err) => {
					// ถ้าตุนแก้ API ให้ return [] มาในกรณี ไม่มีใครกด like เดี๋ยวมาลบ 404 ออก
					// จัดการกรณี 404 - ไม่มีใครกด like
					if (err.status === 404) {
						this.allUsersLikedSubjectReviews = [];
						this.currentUserLikedSubjectReviews = [];
						this.isCurrentUserLiked = false;
						// ไม่ต้อง log error เพราะเป็นกรณีปกติ
					} else {
						// log error กรณีอื่นๆ ที่ไม่ใช่ 404
						console.error('Error fetching review likes:', err);
					}
					this.isLoadingAllUsersLikedSubjectReviews = false;
				},
			});
		}
	}

	public getSubjectDetailUrl(): string {
		return this.router.serializeUrl(this.router.createUrlTree(['/subject/subject-detail', this.subjectReviewData.subject_id]));
	}
}
