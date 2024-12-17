import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'sdm-search-bar',
    standalone: true,
    imports: [IconComponent, ReactiveFormsModule, CommonModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.css',
})
export class SDMSearchBarComponent implements OnChanges {
    @Input() subjectData: SubjectCardData[] = [];
    @Output() searchedSubjectCardDataList = new EventEmitter<SubjectCardData[]>();
    searchForm: FormGroup;
    public subjectCardData!: SubjectCardData[];
    public filteredSubjectCardDataList: SubjectCardData[] = [];
    public searchValue: string = '';
    public isFocus: boolean = false;

    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            search: [''],
        });
    }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['subjectData']) {
			console.log('Subject Data updated:', this.subjectData);
            this.subjectCardData = this.subjectData;
		}
	}

    onSearch() {
        this.searchValue = this.searchForm.get('search')?.value || '';
        this.checkSearchValue(this.searchValue);
        this.filteredSubjectCardDataList = this.subjectCardData.filter(
            (subject) =>
                subject.subject_id
                    .toLowerCase()
                    .includes(this.searchValue.toLowerCase()) ||
                subject.subject_name_en
                    .toLowerCase()
                    .includes(this.searchValue.toLowerCase()),
        );
		console.log('from search :',this.filteredSubjectCardDataList)
        this.searchedSubjectCardDataList.emit(this.filteredSubjectCardDataList);
    }

    checkSearchValue(searchValue: string) {
        if (searchValue !== '') {
            this.isFocus = true;
        }
    }

    clearSearch() {
        this.searchForm.reset();
        this.isFocus = false;
        this.searchedSubjectCardDataList.emit(this.subjectCardData);
    }
}