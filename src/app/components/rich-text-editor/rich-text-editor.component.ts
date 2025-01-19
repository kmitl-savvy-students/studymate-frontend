import { finalize } from 'rxjs';
import {
	AfterViewInit,
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
import { SDMConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-rich-text-editor',
	standalone: true,
	imports: [
		NgxEditorModule,
		IconComponent,
		CommonModule,
		FormsModule,
		SDMConfirmModalComponent,
	],
	templateUrl: './rich-text-editor.component.html',
	styleUrl: './rich-text-editor.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class SDMRichTextEditor
	implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
	@Input() isEdit: boolean = false;
	@Input() editReviewContent: string = '';
	@Input() rating: number = 0;
	@Input() selectedYear?: number = 0;
	@Input() selectedSemester?: number = 0;
	@Input() signedIn: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() subjectId!: string;
	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() cancelEditReview = new EventEmitter<void>();
	@Output() resetComponent = new EventEmitter<void>();
	public editor: Editor;
	public review_content: string = '';
	public defaultText: string =
		'<p>very <strong>good </strong><u>eiei</u></p>';
	public setupContent: string = 'hello world';
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
	ngAfterViewInit(): void {
		initFlowbite();
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
		}
	}

	public onSubmitReview() {
		console.log(this.selectedSemester);
		if (!this.rating) {
			this.alertService.showAlert('error', 'โปรดให้คะแนนรายวิชา');
		} else if (!this.selectedYear) {
			this.alertService.showAlert('error', 'โปรดเลือกปีการศึกษา');
		} else if (!this.selectedSemester) {
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
						},
						error: (err) => {
							switch (err.status) {
								case 409:
									this.alertService.showAlert(
										'error',
										'คุณเคยรีวิวรายวิชานี้ไปแล้ว',
									);
									break;
								case 500:
									this.alertService.showAlert(
										'error',
										'An error occurred while submitting your review. Please try again later.',
									);
									break;
							}
						},
					});
				//reset
				this.resetComponent.emit();
				this.rating = 0;
				this.selectedSemester = 0;
				this.selectedYear = 0;
				this.review_content = '';
			}
		}
	}

	public updateReview() {
		if (this.currentUser) {
			this.apiManagementService
				.UpdateSubjectReviewByUser(
					this.currentUser.id,
					this.subjectId,
					this.review_content,
				)
				.subscribe({
					next: (res) => {
						this.alertService.showAlert(
							'success',
							'แก้ไขรีวิวสำเร็จ',
						);
					},
					error: (err) => {
						const error = JSON.parse(err.error);
						if (
							error === 'You have already reviewed this subject.'
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

	public onCancelEditReview() {
		this.cancelEditReview.emit();
	}

	public onConfirmEditReview() {
		this.updateReview();
		this.confirmEditReview.emit();
	}
}
