import { AfterViewInit, Component, OnInit, SimpleChanges } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { SDMWriteReviewBoxComponent } from '../../components/write-review-box/write-review-box.component';
import { subjectReviewData } from './subject-detail-page-data';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [
		SDMSubjectDetailCpnComponent,
		CommonModule,
		SDMReviewFilterComponent,
		SDMWriteReviewBoxComponent,
	],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit, AfterViewInit {
	public eachSubjectData!: SubjectCardData;
	public subjectDetail!: subjectDetailData;
	public subjectReviewData: SubjectReviewData[] = [];

	public isLoadingReview: boolean = false;

	public signedIn: boolean = false;
	public currentUser: User | null = null;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private apiManagementService: APIManagementService,
		private authService: AuthenticationService,
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoadingReview']) {
			console.log('Loading:', changes['isLoading'].currentValue);
		}
	}

	ngOnInit(): void {
		this.authService.signedIn$.subscribe((signedIn) => {
			this.signedIn = signedIn;
		});
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});

		this.route.queryParams.subscribe((params) => {
			const subjectData = params['subject'];

			if (subjectData) {
				this.eachSubjectData = JSON.parse(subjectData);
			} else {
				this.router.navigate(['/subject']);
			}
		});
		this.getSubjectDetail();
		this.getSubjectReviews();
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public getSubjectDetail() {
		this.apiManagementService
			.GetCurriculumTeachtableSubject(this.eachSubjectData.subject_id)
			.subscribe({
				next: (res) => {
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

	public getSubjectReviews() {
		this.isLoadingReview = true;

		this.apiManagementService
			.GetSubjectReviewsBySubjectID(this.eachSubjectData.subject_id)
			.subscribe({
				next: (res) => {
					if (res) {
						this.subjectReviewData = res;
						console.log(
							'รีวิวของวิชานี้ :',
							this.subjectReviewData,
						);
					} else {
						console.log('No Subject Reviews Data Available.');
					}
					this.isLoadingReview = false;
				},
				error: (error) => {
					if (error.status === 404) {
						console.error('Not found!!!!!!!');
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}
					this.isLoadingReview = false;
				},
			});
	}
}
