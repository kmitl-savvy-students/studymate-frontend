import { Component, EventEmitter, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { subjectCardData } from '../../pages/subject/subject-page-data';

@Component({
	selector: 'sdm-search-bar',
	standalone: true,
	imports: [IconComponent, ReactiveFormsModule],
	templateUrl: './search-bar.component.html',
	styleUrl: './search-bar.component.css',
})
export class SDMSearchBarComponent {
	@Output() searchedSubjectCardDataList = new EventEmitter<
		SubjectCardData[]
	>();
	searchForm: FormGroup;
	public subjectCardData = subjectCardData;
	public filteredSubjectCardDataList: SubjectCardData[] = [];

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			search: [''],
		});
	}

	onSearch() {
		const searchValue = this.searchForm.get('search')?.value || ''; // ดึงค่าที่เป็น string
		this.filteredSubjectCardDataList = this.subjectCardData.filter(
			(subject) =>
				subject.subject_id
					.toLowerCase()
					.includes(searchValue.toLowerCase()) ||
				subject.subject_name_en
					.toLowerCase()
					.includes(searchValue.toLowerCase()),
		);

		this.searchedSubjectCardDataList.emit(this.filteredSubjectCardDataList);
	}

	clearSearch() {
		this.searchForm.reset();
		this.searchedSubjectCardDataList.emit(this.subjectCardData);
	}
}
