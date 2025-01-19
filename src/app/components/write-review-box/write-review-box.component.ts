import { CommonModule } from '@angular/common';
import {
	Component,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMSelectComponent } from '../select/select.component';
import {
	semesterList,
	yearsList,
} from '../../pages/subject/subject-page-data.js';
import { SelectedData } from '../../shared/models/SdmAppService.model.js';
import { SDMRatingComponent } from '../rating/rating.component';
import { SDMRichTextEditor } from '../rich-text-editor/rich-text-editor.component';
import { SDMButtonLink } from '../buttons/button-link.component';
import { User } from '../../shared/models/User.model.js';

@Component({
	selector: 'sdm-write-review-box',
	standalone: true,
	imports: [
		CommonModule,
		IconComponent,
		SDMSelectComponent,
		SDMRatingComponent,
		SDMRichTextEditor,
		SDMButtonLink,
	],
	templateUrl: './write-review-box.component.html',
	styleUrl: './write-review-box.component.css',
})
export class SDMWriteReviewBoxComponent {
	@Input() isEdit: boolean = false;
	@Input() signedIn: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() subjectId!: string;
	@Input() editReviewContent: string = '';
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

	public onMarkdownChange(content: string): void {
		this.markdownContent = content; // รับค่าจาก Markdown Editor
	}

	public handleSelectChange(selectName: string, selectedData: SelectedData) {
		switch (selectName) {
			case 'selectedYear':
				this.selectedYear = selectedData.value;
				break;
			case 'selectedSemester':
				this.selectedSemester = selectedData.value;
				break;
		}
	}

	public updatePermission() {}

	public onRatingChange(rating: number) {
		this.reviewRating = rating;
	}

	public checkSelectAllDropdown() {
		if (this.selectedYear && this.selectedSemester) {
			this.isSelectAllDropdown = true;
		} else {
			this.isSelectAllDropdown = false;
		}

		console.log('isSelectAllDropdown', this.isSelectAllDropdown);
	}

	public resetForm(): void {
		this.reviewRating = 0;
		this.selectedSemester = 0;
		this.selectedYear = 0;
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
