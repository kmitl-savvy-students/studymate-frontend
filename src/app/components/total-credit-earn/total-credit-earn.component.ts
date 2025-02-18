import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-total-credit-earn',
	imports: [CommonModule],
	template: `
		<ng-container *ngIf="!isCollectCredit">
			<div class="flex flex-row items-center text-left align-middle">
				<div>
					<span class="mr-2 text-sm">หน่วยกิตที่ได้รับ:</span>
				</div>
				<div [ngClass]="defaultClasses" [ngStyle]="Checked ? { 'background-color': bgColor, 'color': 'white' } : {}">{{ earnCredit }} / {{ totalCredit }}</div>
			</div>
		</ng-container>

		<ng-container *ngIf="isCollectCredit">
			<div class="flex flex-row items-center">
				<span class="mr-2 text-sm">หน่วยกิตที่ลงไป: </span>
				<div [ngClass]="defaultClasses" [ngStyle]="Checked ? { 'background-color': bgColor, 'color': 'white' } : {}">
					{{ earnCredit }}
				</div>
			</div>
		</ng-container>
	`,
})
export class SDMTotalCreditEarnComponent {
	@Input() isCollectCredit: boolean = false;
	@Input() earnCredit: number = 0;
	@Input() totalCredit: number = 0;
	@Input() Checked?: boolean = false;
	@Input() bgColor?: string = '#2563eb';

	// คลาสพื้นฐานที่ใช้ตลอด
	public defaultClasses = ['text-md', 'rounded-xl', 'py-1.5', 'px-2', 'font-bold', 'bg-gray-100', 'text-black'];
}
