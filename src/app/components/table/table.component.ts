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
	isExpanded1: boolean = true;
	isExpanded2: boolean = true;
	toggleExpand1() {
		this.isExpanded1 = !this.isExpanded1;
	}
	toggleExpand2() {
		this.isExpanded2 = !this.isExpanded2;
	}
}
