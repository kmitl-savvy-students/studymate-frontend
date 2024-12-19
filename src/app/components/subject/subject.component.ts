import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { Router } from '@angular/router';
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

	constructor(private router: Router) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	public seeDetailSubject() {
		const url = this.router.serializeUrl(
			this.router.createUrlTree(['/subject/subject-detail'], {
				queryParams: { subject: JSON.stringify(this.subjectCardData) },
			}),
		);
		window.open(url, '_blank');
	}
}
