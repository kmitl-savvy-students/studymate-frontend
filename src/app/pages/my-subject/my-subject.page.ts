import { Component } from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { CreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [TableComponent, CreditDashboardComponent],
	templateUrl: './my-subject.page.html',
	styleUrl: './my-subject.page.css',
})
export class SDMMySubject {}
