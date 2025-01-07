import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewEncapsulation,
} from '@angular/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { User } from '../../shared/models/User.model.js';
import { AlertService } from '../../shared/services/alert/alert.service.js';
import { HttpEventType } from '@angular/common/http';

@Component({
	selector: 'sdm-rich-text-editor',
	standalone: true,
	imports: [NgxEditorModule, IconComponent, CommonModule, FormsModule],
	templateUrl: './rich-text-editor.component.html',
	styleUrl: './rich-text-editor.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class SDMRichTextEditor implements OnInit, OnDestroy, OnChanges {
	@Input() isEdit: boolean = false;
	@Input() rating: number = 0;
	@Input() selectedYear?: number = 0;
	@Input() selectedSemester?: number = 0;
	@Input() signedIn: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() subjectId!: string;
	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() cancelEditReview = new EventEmitter<void>();
	@Output() reviewSuccess = new EventEmitter<void>();
	public editor: Editor;
	public review_content: string = '';
	public toolbar: Toolbar = [
		['bold', 'italic'],
		['underline', 'strike'],
		['ordered_list', 'bullet_list'],
		['align_left', 'align_center', 'align_right', 'align_justify'],
		['link'],
	];

	constructor(
		private apiManagementService: APIManagementService,
		private alertService: AlertService,
	) {
		this.editor = new Editor();
	}

	ngOnInit(): void {
		this.editor = new Editor();
	}

	ngOnDestroy(): void {
		this.editor.destroy();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes['rating'] ||
			changes['selectedYear'] ||
			changes['selectedSemester'] ||
			changes['content']
		) {
			console.log(this.rating, this.selectedYear, this.selectedSemester);
			console.log('review : ', this.review_content);
		}
	}

	public onSubmitReview() {
		if (this.rating === 0) {
			this.alertService.showAlert('error', 'โปรดให้คะแนนรายวิชา');
		} else if (this.selectedYear === undefined) {
			this.alertService.showAlert('error', 'โปรดเลือกปีการศึกษา');
		} else if (this.selectedSemester === undefined) {
			this.alertService.showAlert('error', 'โปรดเลือกภาคการศึกษา');
		} else if (this.review_content === '') {
			this.alertService.showAlert('error', 'โปรดเขียนรีวิว');
		} else {
			if (this.currentUser) {
				this.apiManagementService
					.CreateSubjectReviewByUser(
						this.currentUser.id,
						this.selectedYear,
						this.selectedSemester,
						this.subjectId,
						this.review_content,
						this.rating,
					)
					.subscribe({
						next: (res) => {
							this.alertService.showAlert(
								'success',
								'รีวิวสำเร็จ',
							);
							this.reviewSuccess.emit();
							this.review_content = '';
							this.rating = 0;
							this.selectedYear = undefined;
							this.selectedSemester = undefined;
						},
						error: (err) => {
							const error = JSON.parse(err.error);
							if (
								error ===
								'You have already reviewed this subject.'
							) {
								this.alertService.showAlert(
									'error',
									'ไม่สามารถรีวิวที่เคยรีวิวไปแล้วได้',
								);
							}
						},
					});
			}
		}
	}

	public onCancleEditReview() {
		this.cancelEditReview.emit();
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
	}
}
