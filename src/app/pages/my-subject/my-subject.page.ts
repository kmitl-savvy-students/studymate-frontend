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
export class SDMMySubject {
	tableHeaders = ['หมวดวิชา', 'ลงไปแล้ว', 'ขาดอีก'];
	tableRows = [
		{
			category: 'หมวดวิชาศึกษาทั่วไป',
			completed: 30,
			remaining: 0,
			subCategories: [
				{ name: 'วิชาพื้นฐาน', completed: 6, remaining: 0 },
				{
					name: 'วิชาด้านภาษาและการสื่อสาร',
					completed: 9,
					remaining: 0,
				},
				{ name: 'วิชาตามเกณฑ์ของคณะ', completed: 3, remaining: 0 },
				{
					name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
					completed: 12,
					remaining: 0,
				},
			],
		},
		{
			category: 'หมวดวิชาเฉพาะ',
			completed: 88,
			remaining: 12,
			subCategories: [
				{ name: 'วิชาแกน', completed: 30, remaining: 0 },
				{
					name: 'วิชาเฉพาะด้าน',
					completed: 46,
					remaining: 6,
				},
				{
					name: 'วิชาการศึกษาทางเลือก',
					completed: 0,
					remaining: 6,
				},
				{
					name: 'วิชาเลือกเฉพาะสาขา',
					completed: 12,
					remaining: 0,
				},
			],
		},
		{
			category: 'หมวดวิชาเสรี',
			completed: 6,
			remaining: 0,
			subCategories: [],
		},
	];
}
