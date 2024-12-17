import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';

@Component({
    selector: 'sdm-search-bar',
    standalone: true,
    imports: [IconComponent, ReactiveFormsModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.css',
})
export class SDMSearchBarComponent implements OnInit, OnChanges {
    @Input() subjectData: SubjectCardData[] = [];
    @Output() searchedSubjectCardDataList = new EventEmitter<SubjectCardData[]>();
    searchForm: FormGroup;
    public subjectCardData!: SubjectCardData[];
    public filteredSubjectCardDataList: SubjectCardData[] = [];

    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            search: [''],
        });
    }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['subjectData']) {
			console.log('Subject Data updated:', this.subjectData);
		// คุณสามารถทำการกระทำเพิ่มเติมที่เกี่ยวข้องกับการเปลี่ยนแปลงนี้ได้ที่นี่
		}
	}

    ngOnInit(): void {
        this.subjectCardData = this.subjectData;
    }

    onSearch() {
        const searchValue = this.searchForm.get('search')?.value || '';
        this.filteredSubjectCardDataList = this.subjectCardData.filter(
            (subject) =>
                subject.subject_id
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                subject.subject_name_en
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()),
        );
		console.log('from search :',this.filteredSubjectCardDataList)
        this.searchedSubjectCardDataList.emit(this.filteredSubjectCardDataList);
    }

    clearSearch() {
        this.searchForm.reset();
        this.searchedSubjectCardDataList.emit(this.subjectCardData);
    }
}