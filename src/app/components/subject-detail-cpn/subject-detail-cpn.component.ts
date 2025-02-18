import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Subject } from '@models/Subject.model.js';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { IconComponent } from '../icon/icon.component.js';
import { SDMLoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

@Component({
	selector: 'sdm-subject-detail-cpn',
	standalone: true,
	imports: [CommonModule, IconComponent, SDMLoadingSkeletonComponent],
	templateUrl: './subject-detail-cpn.component.html',
	styleUrl: './subject-detail-cpn.component.css',
})
export class SDMSubjectDetailCpnComponent {
	@Input() subjectDetailData?: SubjectCardData;
	@Input() subjectData?: Subject;
	// @Input() subjectDetailDescription?: subjectDetailData;

	get isLoadingData(): boolean {
		return !this.subjectDetailData; // ถ้า subjectDetailData เป็น undefined/null ให้ isLoading = true
	}

	get isLoadingDescription(): boolean {
		return !this.subjectData; // ถ้า subjectDetailDescription เป็น undefined/null ให้ isLoading = true
	}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}
}
