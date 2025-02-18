import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { SDMLoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

@Component({
	selector: 'sdm-show-subjects-open',
	standalone: true,
	imports: [CommonModule, SDMLoadingSkeletonComponent],
	templateUrl: './show-subjects-open.component.html',
	styleUrl: './show-subjects-open.component.css',
})
export class SDMShowSubjectsOpenComponent implements OnInit {
	@Input() selectedYear: number = -1;
	@Input() selectedSemester: number = -1;
	@Input() selectedProgram: number = -1;
	@Input() subjectId: string = '';

	public currentYear: number = new Date().getFullYear() + 543;
	public classYear: number[] = Array.from({ length: 4 }, (_, i) => this.currentYear - 1 - i);
	public currentSemesters: number[] = [1, 2, 3];
	public firstYear: boolean[] = [false, false, false];
	public secondYear: boolean[] = [false, false, false];
	public thirdYear: boolean[] = [false, false, false];
	public fourthYear: boolean[] = [false, false, false];
	public isloading: boolean = false;
	public columns: number[] = [1, 2, 3, 4];

	constructor(private apiManagementService: APIManagementService) {}

	async ngOnInit(): Promise<void> {
		this.isloading = true;
		this.firstYear = await this.initOpenSubjects(this.classYear[0]);
		console.log(this.firstYear);
		this.secondYear = await this.initOpenSubjects(this.classYear[1]);
		console.log(this.secondYear);
		this.thirdYear = await this.initOpenSubjects(this.classYear[2]);
		console.log(this.thirdYear);
		this.fourthYear = await this.initOpenSubjects(this.classYear[3]);
		console.log(this.fourthYear);
		this.isloading = false;
	}

	async initOpenSubjects(year: number) {
		const results = await Promise.all(this.currentSemesters.map((semester) => this.checkSubjectOpen(year, semester)));

		return results.map((res) => (res ? true : false));
	}

	public checkSubjectOpen(year: number, semester: number): Promise<any> {
		return new Promise((resolve) => {
			this.apiManagementService.GetOpenSubjectData(year - 543, semester, this.selectedProgram, this.subjectId).subscribe({
				next: (res) => {
					console.log(res);
					resolve(res ? res : null);
				},
				error: (error) => {
					console.error('Error:', error.status);
					resolve(null);
				},
			});
		});
	}
}
