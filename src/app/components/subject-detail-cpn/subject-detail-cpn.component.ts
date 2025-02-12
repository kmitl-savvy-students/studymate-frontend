import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component.js';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model.js';
import { SDMLoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { loadingSkeletonType } from '../../shared/models/SdmAppService.model.js';

@Component({
	selector: 'sdm-subject-detail-cpn',
	standalone: true,
	imports: [CommonModule, IconComponent, SDMLoadingSkeletonComponent],
	templateUrl: './subject-detail-cpn.component.html',
	styleUrl: './subject-detail-cpn.component.css',
})
export class SDMSubjectDetailCpnComponent {
	@Input() subjectDetailData?: SubjectCardData;
	@Input() subjectDetailDescription?: subjectDetailData;

	get isLoadingData(): boolean {
		return !this.subjectDetailData; // ถ้า subjectDetailData เป็น undefined/null ให้ isLoading = true
	}

	get isLoadingDescription(): boolean {
		return !this.subjectDetailDescription; // ถ้า subjectDetailDescription เป็น undefined/null ให้ isLoading = true
	}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}
}
