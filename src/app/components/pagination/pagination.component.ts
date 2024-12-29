import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
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
	@Input() itemsPerPage: number = 0;
	@Input() currentPage: number = 0;
	@Input() scrollTargetId: string = '';
	@Input() offset: number = 100;
	@Output() pageChange = new EventEmitter<number>();

	public visiblePages: number = 5;

	public get totalPages(): number {
		const showTotal = Math.ceil(this.totalItems / this.itemsPerPage);
		return showTotal;
	}

	public get pagesToShow(): number[] {
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

	public changePage(page: number) {
		if (page === this.currentPage) return;
		this.pageChange.emit(page);
		this.scrollToTarget();
	}

	private scrollToTarget() {
		const targetElement = this.scrollTargetId
			? document.getElementById(this.scrollTargetId)
			: null;

		if (targetElement) {
			const targetPosition =
				targetElement.getBoundingClientRect().top + window.scrollY;
			window.scrollTo({
				top: targetPosition - this.offset,
				behavior: 'smooth',
			});
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
}
