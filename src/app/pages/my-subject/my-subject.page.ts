import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { CreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';
import { AdviceDashboardComponent } from '../../components/advice-dashboard/advice-dashboard.component';
import { initFlowbite } from 'flowbite';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TranscriptService } from '../../shared/transcript.service';
import { AuthService } from '../../shared/auth.service';

type CategoryName = 'หมวดวิชาศึกษาทั่วไป' | 'หมวดวิชาเฉพาะ' | 'หมวดวิชาเสรี';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		TableComponent,
		CreditDashboardComponent,
		AdviceDashboardComponent,
		ImportTranscriptComponent,
		IconComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMMySubject implements OnInit, AfterViewInit {
	tableHeaders = ['หมวดวิชา', 'ลงไปแล้ว', 'ขาดอีก'];
	tableRows: any[] = [];

	private _totalCompleted: number = 0;

	constructor(
		private transcriptService: TranscriptService,
		private authService: AuthService,
	) {}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	ngOnInit(): void {
		this.authService.getToken().subscribe({
			next: (userToken) => {
				if (!userToken) {
					return;
				}

				const userTokenId = userToken.id;
				this.transcriptService
					.getTranscriptData(userTokenId)
					.subscribe({
						next: (response) => {
							if (response.code !== '200') {
								console.error(
									'Failed to fetch transcript data:',
									response.message,
								);
								return;
							}

							const transcriptData = response.data;
							this.processTranscriptData(transcriptData);
						},
						error: (error) => {
							console.error(
								'Error fetching transcript data:',
								error,
							);
						},
					});
			},
		});
	}

	private subjectTitleMap: { [key: string]: string } = {
		'90641001': 'CHARM SCHOOL',
		'90641002': 'DIGITAL INTELLIGENCE QUOTIENT',
		'90641003': 'SPORTS AND RECREATIONAL ACTIVITIES',
		'90644007': 'FOUNDATION ENGLISH 1',
		'90644008': 'FOUNDATION ENGLISH 2',
		// ... add other mappings
	};

	private categoryCreditRequirements: { [key in CategoryName]: number } = {
		หมวดวิชาศึกษาทั่วไป: 30,
		หมวดวิชาเฉพาะ: 100,
		หมวดวิชาเสรี: 6,
	};

	private processTranscriptData(transcriptData: any[]) {
		this.tableRows = [];

		const categories: { [key in CategoryName]: any[] } = {
			หมวดวิชาศึกษาทั่วไป: [],
			หมวดวิชาเฉพาะ: [],
			หมวดวิชาเสรี: [],
		};

		for (const entry of transcriptData) {
			const subjectId = entry.subjectId;
			const grade = entry.grade;
			const credit = entry.credit;
			const semester = entry.semester;
			const year = entry.year;
			const title = this.subjectTitleMap[subjectId] || '';

			let category: CategoryName = 'หมวดวิชาเสรี';

			if (subjectId.startsWith('9064')) {
				category = 'หมวดวิชาศึกษาทั่วไป';
			} else if (subjectId.startsWith('0107')) {
				category = 'หมวดวิชาเฉพาะ';
			}

			categories[category].push({
				code: subjectId,
				title: title,
				grade: grade,
				credit: credit,
				semester: semester,
				year: year,
			});
		}

		for (const [categoryName, subjects] of Object.entries(categories)) {
			const catName = categoryName as CategoryName;
			const completedCredits = subjects.reduce((sum, subj) => {
				if (subj.grade !== '0') {
					return sum + (subj.credit || 0);
				}
				return sum;
			}, 0);

			const totalCategoryCredits =
				this.categoryCreditRequirements[catName] || 0;
			const remainingCredits = totalCategoryCredits - completedCredits;

			const tableRow = {
				category: categoryName,
				completed: completedCredits,
				remaining: remainingCredits,
				subCategories: [
					{
						name: '',
						completed: completedCredits,
						remaining: remainingCredits,
						courses: subjects.map((subj) => ({
							code: subj.code,
							title: subj.title || '',
						})),
					},
				],
			};

			this.tableRows.push(tableRow);
		}

		this.updateTotals();
	}

	private updateTotals() {
		const totals = this.calculateTotals();
		this._totalCompleted = totals.totalCompleted;
	}

	private calculateTotals() {
		let totalCompleted = 0;

		for (const row of this.tableRows) {
			totalCompleted += row.completed || 0;
		}

		return { totalCompleted };
	}

	get totalCredit(): number {
		return 136;
	}

	get totalCompleted(): number {
		return this._totalCompleted;
	}

	get totalRemaining(): number {
		return this.totalCredit - this.totalCompleted;
	}
}
