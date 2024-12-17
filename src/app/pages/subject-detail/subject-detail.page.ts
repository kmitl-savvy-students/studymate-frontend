import { Component, AfterViewInit, Input, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { SubjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
@Component({
	selector: 'sdm-subject-detail',
	standalone: true,
	imports: [SDMSubjectDetailCpnComponent, CommonModule],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMSubjectDetail implements OnInit, AfterViewInit {
	public subjectData!: SubjectCardData;

	constructor(private router: Router) {}

	// ngOnInit(): void {
	// 	const navigation = this.router.getCurrentNavigation();
	// 	this.subjectData = navigation?.extras.state?.['subjectData'];

	// 	if (!this.subjectData) {
	// 		console.error('No subject data found!');
	// 	}
	// }

	ngAfterViewInit(): void {
		initFlowbite();
	}

	ngOnInit(): void {
		this.subjectData = history.state.subjectData;
		console.log(this.subjectData);
	}
}
