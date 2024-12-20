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
	@Input() index: number = 0;

	constructor(private router: Router) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	public getSubjectDetailUrl(): string {
		return this.router.serializeUrl(
			this.router.createUrlTree(['/subject/subject-detail'], {
				queryParams: { subject: JSON.stringify(this.subjectCardData) },
			}),
		);
	}
}
