import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { Router } from '@angular/router';
// import { TeachData } from '../../shared/models/CurriculumTeachtableSubject.model.js';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent {
	@Input() subjectCardData!: SubjectCardData;
	@Input() index: number = 0;

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
	) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	public seeDetailSubject() {
		this.router.navigate(['/subject-detail'], {
			state: { subjectData: this.subjectCardData },
		});
	}
}
