import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-credit-dashboard',
	standalone: true,
	imports: [],
	templateUrl: './credit-dashboard.component.html',
	styleUrl: './credit-dashboard.component.css',
})
export class SDMCreditDashboardComponent {
	@Input() totalCompleted: number = 0;
	@Input() totalRemaining: number = 0;
	@Input() totalCredit: number = 0;
}
