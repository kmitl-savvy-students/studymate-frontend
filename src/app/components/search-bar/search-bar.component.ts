import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
} from '@angular/core';
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
export class SDMSearchBarComponent {
	@Input() data: any[] = [];
	@Input() filterFunction!: (data: any[], searchValue: string) => any[];
	@Output() searchedDataList = new EventEmitter<any[]>();

	searchForm: FormGroup;

	public filteredDataList: any[] = [];
	public searchValue: string = '';
	public isFocus: boolean = false;

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			search: [''],
		});
	}

	onSearch() {
		this.searchValue = this.searchForm.get('search')?.value || '';
		this.checkSearchValue(this.searchValue);

		if (this.filterFunction) {
			this.filteredDataList = this.filterFunction(
				this.data,
				this.searchValue,
			);
		} else {
			throw new Error('filterFunction is required');
		}
		this.searchedDataList.emit(this.filteredDataList);
	}

	checkSearchValue(searchValue: string) {
		if (searchValue !== '') {
			this.isFocus = true;
		}
	}

	clearSearch() {
		this.searchForm.reset();
		this.isFocus = false;
		this.searchedDataList.emit(this.data);
	}
}
