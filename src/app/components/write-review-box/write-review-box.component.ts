import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { SDMSelectComponent } from '../select/select.component';
import {
	semesterList,
	yearsList,
} from '../../pages/subject/subject-page-data.js';
import { SelectedData } from '../../shared/models/SdmAppService.model.js';
import { SDMRatingComponent } from '../rating/rating.component';
import { SDMRichTextEditor } from '../rich-text-editor/rich-text-editor.component';

@Component({
	selector: 'sdm-write-review-box',
	standalone: true,
	imports: [
		CommonModule,
		IconComponent,
		SDMSelectComponent,
		SDMRatingComponent,
		SDMRichTextEditor,
	],
	templateUrl: './write-review-box.component.html',
	styleUrl: './write-review-box.component.css',
})
export class SDMWriteReviewBoxComponent {
	@Input() isEdit: boolean = false;
	public selectedYear: number = 0;
	public selectedSemester: number = 0;

	public yearsList = yearsList;
	public semesterList = semesterList;

	public isSelectAllDropdown: boolean = false;

	public markdownContent: string = '';

	public onMarkdownChange(content: string): void {
		this.markdownContent = content; // รับค่าจาก Markdown Editor
	}

	public handleSelectChange(selectName: string, selectedData: SelectedData) {
		switch (selectName) {
			case 'selectedYear':
				this.selectedYear = selectedData.value;
				console.log('Selected Year !:', this.selectedYear);
				break;
			case 'selectedSemester':
				this.selectedSemester = selectedData.value;
				console.log('Selected Semester:', this.selectedSemester);
				break;

			// if (this.isSelectAllDropdown) {
			//   console.log('All dropdowns selected, calling getSubjectData()');
			//   this.getSubjectData();
			// }
		}
	}

	public checkSelectAllDropdown() {
		if (this.selectedYear && this.selectedSemester) {
			this.isSelectAllDropdown = true;
		} else {
			this.isSelectAllDropdown = false;
		}

		console.log('isSelectAllDropdown', this.isSelectAllDropdown);
	}
}
