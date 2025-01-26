import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { Router } from '@angular/router';
import { SDMRatingComponent } from '../rating/rating.component';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule, SDMRatingComponent],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent {
	@Input() subjectCardData!: SubjectCardData;

	@Input() selectedYear: number = 0;
	@Input() selectedSemester: number = 0;
	@Input() selectedFaculty: string = '';
	@Input() selectedDepartment: string = '';
	@Input() selectedCurriculum?: string = '';
	@Input() selectedClassYear: number = -1;
	@Input() selectedCurriculumYear?: string = '';
	@Input() selectedUniqueId?: string = '';

	constructor(private router: Router) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	public getSubjectDetailUrl(): string | undefined {
		let latestSubjectDetailUrl: string;

		if (
			this.selectedFaculty === '90' &&
			this.selectedDepartment === '90' &&
			this.selectedCurriculum === 'x'
		) {
			// ใช้ path สำหรับกรณี selectedFaculty === '90' && selectedDepartment === '90'
			latestSubjectDetailUrl = this.router
				.createUrlTree([
					'/subject/subject-detail',
					this.selectedYear,
					this.selectedSemester,
					this.selectedFaculty,
					this.selectedDepartment,
					this.selectedCurriculum,
					this.selectedClassYear,
					this.subjectCardData.section,
					this.subjectCardData.subject_id,
				])
				.toString();
			return latestSubjectDetailUrl;
		} else if (this.selectedCurriculumYear && this.selectedUniqueId) {
			// ใช้ path สำหรับกรณี selectedFaculty === '01' && selectedDepartment === '05'
			latestSubjectDetailUrl = this.router
				.createUrlTree([
					'/subject/subject-detail',
					this.selectedYear,
					this.selectedSemester,
					this.selectedFaculty,
					this.selectedDepartment,
					this.selectedCurriculum,
					this.selectedClassYear,
					this.selectedCurriculumYear,
					this.selectedUniqueId,
					this.subjectCardData.section,
					this.subjectCardData.subject_id,
				])
				.toString();
			return latestSubjectDetailUrl;
		}

		// เพิ่มการคืนค่า undefined ในกรณีที่ไม่มีเงื่อนไขใดตรงกัน
		return undefined;
	}
}
