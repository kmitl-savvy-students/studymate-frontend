import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [SDMSubjectDetailCpnComponent, CommonModule],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit {
	public eachSubjectData!: SubjectCardData;
	public subjectDetail!: subjectDetailData;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	ngOnInit(): void {
		// ดึง Query Parameters จาก URL
		this.route.queryParams.subscribe((params) => {
			const subjectData = params['subject'];

			if (subjectData) {
				// แปลง JSON String เป็น Object
				this.eachSubjectData = JSON.parse(subjectData);
			} else {
				// หากไม่มีข้อมูล ให้ redirect กลับไปหน้า subject
				this.router.navigate(['/subject']);
				console.warn('No subject data found in queryParams.');
			}
		});
		this.getSubjectDetail();
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public getSubjectDetail() {
		this.apiManagementService
			.GetCurriculumTeachtableSubject(this.eachSubjectData.subject_id)
			.subscribe({
				next: (res) => {
					console.log('API Response:', res);
					if (res) {
						this.subjectDetail = res;
					} else {
						console.log('No Subject Data Available.');
						// this.subjectDetail = [];
					}
				},
				error: (error) => {
					if (error.status === 404) {
						console.error('Not found');
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}
				},
			});
	}
}
