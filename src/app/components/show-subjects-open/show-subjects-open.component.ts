import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { semesters } from '../../shared/models/SdmAppService.model.js';

@Component({
	selector: 'sdm-show-subjects-open',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './show-subjects-open.component.html',
	styleUrl: './show-subjects-open.component.css',
})
export class SDMShowSubjectsOpenComponent implements OnInit {
	@Input() selectedFaculty: string = '';
	@Input() selectedDepartment: string = '';
	@Input() selectedCurriculum?: string = '';
	@Input() selectedClassYear?: number;
	@Input() selectedCurriculumYear?: string = '';
	@Input() selectedUniqueId?: string = '';
	@Input() subjectId: string = '';
	@Input() section: number = 0;
	public currentYear: number = new Date().getFullYear() + 543;
	public classYear: number[] = Array.from(
		{ length: 4 },
		(_, i) => this.currentYear - i,
	);
	public currentSemesters: number[] = [1, 2, 3];
	public firstYear: boolean[] = [false, false, false];
	public secondYear: boolean[] = [false, false, false];
	public thirdYear: boolean[] = [false, false, false];
	public fourthYear: boolean[] = [false, false, false];

	constructor(private apiManagementService: APIManagementService) {}

	async ngOnInit(): Promise<void> {
		this.firstYear = await this.initOpenSubjects(this.classYear[0]);
		console.log(this.firstYear);
		this.secondYear = await this.initOpenSubjects(this.classYear[1]);
		console.log(this.secondYear);
		this.thirdYear = await this.initOpenSubjects(this.classYear[2]);
		console.log(this.thirdYear);
		this.fourthYear = await this.initOpenSubjects(this.classYear[3]);
		console.log(this.fourthYear);
	}

	async initOpenSubjects(year: number) {
		const results = await Promise.all(
			this.currentSemesters.map((semester) =>
				this.checkSubjectOpen(year, semester),
			),
		);

		return results.map((res) => (res ? true : false));
	}

	public checkSubjectOpen(year: number, semester: number): Promise<any> {
		return new Promise((resolve) => {
			this.apiManagementService
				.GetOpenSubjectData(
					year,
					semester,
					this.selectedFaculty,
					this.selectedDepartment,
					this.selectedCurriculum!,
					0,
					this.subjectId,
					this.selectedCurriculumYear,
					this.selectedUniqueId,
				)
				.subscribe({
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
