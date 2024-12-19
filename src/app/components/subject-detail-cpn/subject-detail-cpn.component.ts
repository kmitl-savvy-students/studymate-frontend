import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component.js';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model.js';

@Component({
	selector: 'sdm-subject-detail-cpn',
	standalone: true,
	imports: [CommonModule, IconComponent],
	templateUrl: './subject-detail-cpn.component.html',
	styleUrl: './subject-detail-cpn.component.css',
})
export class SDMSubjectDetailCpnComponent {
	@Input() subjectDetailData!: SubjectCardData;
	@Input() subjectDetail!: subjectDetailData;

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}
}
