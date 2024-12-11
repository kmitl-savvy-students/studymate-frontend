import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMButtonLink } from '../../components/buttons/link/button-link.component';
import { IconComponent } from '../../components/icon/icon.component';
import { RouterLink } from '@angular/router';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { SubjectDetailData } from '../../shared/api-manage/models/SubjectDetailData.model.js';
import { APIManagementService } from '../../shared/api-manage/api-management.service';
@Component({
	selector: 'sdm-subject-detail',
	standalone: true,
	imports: [IconComponent, SDMSubjectDetailCpnComponent, CommonModule],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMSubjectDetail implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
