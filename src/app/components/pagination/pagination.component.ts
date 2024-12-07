import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-pagination',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './pagination.component.html',
	styleUrl: './pagination.component.css',
})
export class SDMPaginationComponent {
	@Input() totalItems: number = 0;
	@Input() itemsPerPage: number = 10;
	@Input() currentPage: number = 1;
	@Output() pageChange = new EventEmitter<number>();
	visiblePages: number = 5;

	get totalPages(): number {
		return Math.ceil(this.totalItems / this.itemsPerPage);
	}

	get pagesToShow(): number[] {
		const halfVisible = Math.floor(this.visiblePages / 2);

		let start = this.currentPage - halfVisible;
		let end = this.currentPage + halfVisible;

		// Adjust the range if near the beginning
		if (start < 1) {
			start = 1;
			end = Math.min(this.visiblePages, this.totalPages);
		}

		// Adjust the range if near the end
		if (end > this.totalPages) {
			end = this.totalPages;
			start = Math.max(1, this.totalPages - this.visiblePages + 1);
		}

		// Generate the range of page numbers
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	changePage(page: number) {
		// if (page >= 1 && page <= this.totalPages) {
		// 	this.pageChange.emit(page);
		// }
		// ถ้าเลือกหน้าเดิมจะไม่ทำอะไร
		if (page === this.currentPage) return;

		// อัปเดต currentPage
		this.pageChange.emit(page);

		// เลื่อนหน้าเว็บไปด้านบนสุด
		this.scrollToTop();
	}

	// ฟังก์ชันเลื่อนหน้าเว็บไปด้านบนสุด
	private scrollToTop() {
		window.scrollTo({
			top: 0, // เลื่อนขึ้นไปที่ด้านบนสุด
			behavior: 'smooth', // การเลื่อนแบบนุ่มนวล
		});
	}
}
