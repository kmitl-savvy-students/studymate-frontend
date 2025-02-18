import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { IconComponent } from '../icon/icon.component';
import { SDMRatingComponent } from '../rating/rating.component';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule, SDMRatingComponent],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent {
	@Input() subjectCardData?: SubjectCardData;

	@Input() selectedYear: number = -1;
	@Input() selectedSemester: number = -1;
	@Input() selectedProgram: number = -1;
	@Input() subjectId: string = '';
	@Input() section: number = -1;

	constructor(private router: Router) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	public getSubjectDetailUrl(): string | undefined {
		let latestSubjectDetailUrl: string;

		if (
			this.selectedYear !== -1 &&
			this.selectedYear !== undefined &&
			this.selectedSemester !== -1 &&
			this.selectedSemester !== undefined &&
			this.selectedProgram !== -1 &&
			this.selectedProgram !== undefined &&
			this.subjectId !== '' &&
			this.subjectId !== undefined &&
			this.section !== -1 &&
			this.section !== undefined
		) {
			latestSubjectDetailUrl = this.router
				.createUrlTree(['/subject/subject-detail', this.selectedYear + 543, this.selectedSemester, this.selectedProgram, this.section, this.subjectId])
				.toString();
			return latestSubjectDetailUrl;
		}
		return undefined;
	}

	getTeacherListContent(): string {
		return this.subjectCardData?.teacher_list_th?.map((teacher: string) => `<div>${teacher}</div>`).join('') || '';
	}
}
