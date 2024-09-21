import { Component } from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { CreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';
import { AdviceDashboardComponent } from '../../components/advice-dashboard/advice-dashboard.component';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		TableComponent,
		CreditDashboardComponent,
		AdviceDashboardComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrl: './my-subject.page.css',
})
export class SDMMySubject {}
