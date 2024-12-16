import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { SubjectDetailData } from '../../shared/api-manage/models/SubjectDetailData.model.js';
import { APIManagementService } from '../../shared/api-manage/api-management.service';
@Component({
	selector: 'sdm-subject-detail',
	standalone: true,
	imports: [SDMSubjectDetailCpnComponent, CommonModule],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMSubjectDetail implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
