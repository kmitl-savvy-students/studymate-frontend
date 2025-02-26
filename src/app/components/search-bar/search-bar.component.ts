import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

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
	@Output() searchCleared = new EventEmitter<void>(); // เพิ่ม event emitter สำหรับแจ้งเมื่อ clear search

	searchForm: FormGroup;

	public filteredDataList: any[] = [];
	public searchValue: string = '';
	public isFocus: boolean = false;

	public tempSubjectData: any[] = [];

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			search: [''],
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['data'] && !this.searchForm.get('search')?.value) {
			// อัพเดท tempSubjectData เมื่อ data เปลี่ยนและไม่มีการ search
			this.tempSubjectData = changes['data'].currentValue;
		}
	}

	handleSearch() {
		this.searchValue = this.searchForm.get('search')?.value || '';
		this.searchValue != '' ? this.onSearch() : this.clearSearch();
	}

	onSearch() {
		// this.tempSubjectData = this.data;

		this.checkSearchValue(this.searchValue);

		if (this.filterFunction) {
			this.filteredDataList = this.filterFunction(this.data, this.searchValue);
		} else {
			throw new Error('filterFunction is required');
		}
		console.log('ผลการค้นหาใน onSearch() : ', this.filteredDataList);
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
		this.searchValue = '';
		this.searchCleared.emit(); // emit event เมื่อ clear search
		// this.searchedDataList.emit(this.tempSubjectData); // ส่งข้อมูลต้นฉบับกลับไป
	}
}
