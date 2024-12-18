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
		this.router.navigate(['/subject-detail'], {
			state: { subjectData: this.subjectCardData },
		});
	}

	// public seeDetailSubject() {
	// 	const subjectDetailUrl = `$/subject-detail/${this.subjectCardData.subject_id}/${this.subjectCardData.section}`;
	// 	this.router.navigate([subjectDetailUrl], {
	// 		state: { subjectData: this.subjectCardData },
	// 	});
	// }
}
