import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-table',
	standalone: true,
	imports: [CommonModule, IconComponent],
	templateUrl: './table.component.html',
	styleUrl: './table.component.css',
})
export class TableComponent {
	@Input() listThead: string[] = [];
	@Input() tableData: any[] = [];

	expandedRows: { [key: number]: boolean } = {};

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

	calculateTotals() {
		let totalCompleted = 0;
		let totalRemaining = 0;

		for (const row of this.tableData) {
			totalCompleted += row.completed;
			totalRemaining += row.remaining;
		}

		return { totalCompleted, totalRemaining };
	}
}
