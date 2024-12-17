import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { SubjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
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
