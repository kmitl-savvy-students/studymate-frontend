import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { APIManagementService } from '../../shared/api-manage/api-management.service.js';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/api-manage/models/SubjectCardData.model.js';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent{
	@Input() subjectCardData!: SubjectCardData;
	@Input() index: number = 0; // ลำดับของ component
	constructor(
		private apiManagementService: APIManagementService,
	) {}
}
