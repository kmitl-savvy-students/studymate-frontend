import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { SDMSubjectReviewComponent } from '../../components/subject-review/subject-review.component';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [
		SDMSubjectDetailCpnComponent,
		CommonModule,
		SDMSubjectReviewComponent,
	],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit {
	public eachSubjectData!: SubjectCardData;
	public subjectDetail!: subjectDetailData;
	// public subjectReviews!: SubjectReviewslData[];

	public selectedYear: number = 0;
	public selectedSemester: number = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const subjectData = params['subject'];

			if (subjectData) {
				this.eachSubjectData = JSON.parse(subjectData);
				this.selectedYear = +params['year'] || 0;
				this.selectedSemester = +params['semester'] || 0;

				console.log('selectedYear', this.selectedYear);
				console.log('selectedSemester', this.selectedSemester);
			} else {
				this.router.navigate(['/subject']);
				console.warn('No subject data found in queryParams.');
			}
		});
		this.getSubjectDetail();
		console.log(
			'eachSubjectData from subject-page.component',
			this.eachSubjectData,
		);
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

	// public getSubjectReviews() {
	// 	this.apiManagementService
	// 		.GetCurriculumTeachtableSubject(this.selectedYear,this.selectedSemester,this.eachSubjectData.subject_id)
	// 		.subscribe({
	// 			next: (res) => {
	// 				console.log('API Response:', res);
	// 				if (res) {
	// 					this.subjectReviews = res;
	// 				} else {
	// 					console.log('No Subject Reviews Data Available.');
	// 				}
	// 			},
	// 			error: (error) => {
	// 				if (error.status === 404) {
	// 					console.error('Not found');
	// 				} else if (error.status === 500) {
	// 					console.error('Internal Server Error');
	// 				} else {
	// 					console.error(
	// 						'An unexpected error occurred:',
	// 						error.status,
	// 					);
	// 				}
	// 			},
	// 		});
	// }
}
