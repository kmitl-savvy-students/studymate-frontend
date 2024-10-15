import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ModalComponent } from '../modals/my-subject-modal/my-subject-modal.component';
import { Modal } from 'flowbite';

@Component({
	selector: 'sdm-table',
	standalone: true,
	imports: [CommonModule, IconComponent, ModalComponent],
	templateUrl: './table.component.html',
	styleUrl: './table.component.css',
})
export class TableComponent {
	@Input() listThead: string[] = [];
	@Input() tableData: any[] = [];
	@Input() totalCompleted: number = 0;
	@Input() totalRemaining: number = 0;

	expandedRows: { [key: number]: boolean } = {};
	selectedSubRowName: string = '';
	selectedCourses: Array<{ code: string; title: string }> = [];
	initialized: boolean = false;

	ngOnInit() {
		this.tableData.forEach((_, index) => {
			this.expandedRows[index] = true;
		});
	}

	toggleExpand(rowIndex: number) {
		this.expandedRows[rowIndex] = !this.expandedRows[rowIndex];
	}

	isExpanded(rowIndex: number): boolean {
		return !!this.expandedRows[rowIndex];
	}

	hasSubCategories(row: any): boolean {
		return row.subCategories && row.subCategories.length > 0;
	}

	selectSubRow(subRow: {
		name: string;
		courses: { code: string; title: string }[];
	}) {
		this.selectedSubRowName = subRow.name;
		this.selectedCourses = subRow.courses;

		const modalElement = document.getElementById('my-subject-modal');
		const modal = new Modal(modalElement);
		modal.show();
	}
}
