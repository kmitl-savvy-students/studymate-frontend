import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMSubjectAddedModalComponent,
		SDMilterBarComponent,
		SDMSubjectComponent,
		SDMPaginationComponent,
		CommonModule,
	],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit {
	items: string[] = []; // รายวิชา
	currentPage: number = 1; // หน้าปัจจุบัน
	itemsPerPage: number = 10; // จำนวนรายการต่อหน้า
	paginatedItems: string[] = []; // รายวิชาที่จะแสดงในหน้าปัจจุบัน

	ngAfterViewInit(): void {
		initFlowbite();
		this.generateItems(); // สร้างข้อมูลจำลอง
		this.updatePaginatedItems(); // อัปเดตข้อมูลในหน้าปัจจุบัน
	}

	generateItems() {
		// สร้างข้อมูลจำลอง
		for (let i = 1; i <= 100; i++) {
			this.items.push(`Component ที่ ${i}`);
		}
	}

	updatePaginatedItems() {
		// อัปเดตข้อมูลในหน้าปัจจุบัน
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		this.paginatedItems = this.items.slice(start, end);
	}

	changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	subjects_added = [
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076016',
			name: 'COMPUTER ENGINEERING PROJECT PREPARATION',
			credits: 2,
			isSelected: false,
		},
		{
			code: '01076032',
			name: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
	];
}
