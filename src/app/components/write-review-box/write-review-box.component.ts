import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { semesterList, yearsList } from '../../pages/subjects/subject-page-data.js';
import { User } from '../../shared/models/User.model.js';
import { SDMButtonLink } from '../buttons/button-link.component';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { SDMRichTextEditor } from '../rich-text-editor/rich-text-editor.component';

@Component({
	selector: 'sdm-write-review-box',
	standalone: true,
	imports: [CommonModule, IconComponent, SDMRatingComponent, SDMRichTextEditor, SDMButtonLink],
	templateUrl: './write-review-box.component.html',
	styleUrl: './write-review-box.component.css',
})
export class SDMWriteReviewBoxComponent {
	@Input() isEdit: boolean = false;
	@Input() signedIn: boolean = false;
	@Input() hasCompletedSubject: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() subjectId!: string;
	@Input() editReviewContent: string = '';
	@Input() completedSubjectDetails: { year: number | null; term: number | null } | null = null;
	@Input() canReview: boolean = false;
	@Input() isSubjectCompleted: boolean = false;
	@Input() notHaveTranscript: boolean = false;
	@Input() isLoadingTranscript: boolean = false;

	@Output() reviewSuccess = new EventEmitter<void>();
	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() cancelEditReview = new EventEmitter<void>();

	public selectedYear?: number = 0;
	public selectedSemester?: number = 0;

	public yearsList = yearsList;
	public semesterList = semesterList;

	public isSelectAllDropdown: boolean = false;
	public showForm: boolean = true;

	public markdownContent: string = '';

	public reviewRating: number = 0;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoadingTranscript']) {
			this.isLoadingTranscript = changes['isLoadingTranscript'].currentValue;
		}
	}

	public onMarkdownChange(content: string): void {
		this.markdownContent = content;
	}

	public onRatingChange(rating: number) {
		this.reviewRating = rating;
	}

	public resetForm(): void {
		this.reviewRating = 0;
		this.showForm = false;
		setTimeout(() => {
			this.showForm = true;
		}, 0);
	}

	public onReviewSuccess() {
		this.reviewSuccess.emit();
		this.resetForm();
	}

	public onCancelEditReview() {
		this.cancelEditReview.emit();
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
	}
}
