import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from '@models/Subject.model';
import { initFlowbite } from 'flowbite';
import { SDMRatingComponent } from '../../components/rating/rating.component';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { SDMShowSubjectsOpenComponent } from '../../components/show-subjects-open/show-subjects-open.component';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { SDMWriteReviewBoxComponent } from '../../components/write-review-box/write-review-box.component';
import { paginationType } from '../../shared/models/SdmAppService.model';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { User } from '../../shared/models/User.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [SDMSubjectDetailCpnComponent, CommonModule, SDMReviewFilterComponent, SDMWriteReviewBoxComponent, SDMRatingComponent, SDMShowSubjectsOpenComponent],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit, AfterViewInit {
	public eachSubjectData?: SubjectCardData;
	public subjectData?: Subject;
	public subjectReviewData: SubjectReviewData[] = [];

	public isLoadingReview: boolean = false;

	public signedIn: boolean = false;
	public currentUser: User | null = null;

	public selectedYear: number = -1;
	public selectedSemester: number = -1;
	public selectedCurriculum: number = -1;
	public subjectId: string = '';
	public section: number = -1;

	public avgReviewRating: number = 4;
	public reviewCount: number = 30;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private apiManagementService: APIManagementService,
		private authService: AuthenticationService,
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoadingReview']) {
		}
	}

	ngOnInit(): void {
		this.authService.signedIn$.subscribe((signedIn) => {
			this.signedIn = signedIn;
		});
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});

		this.route.params.subscribe((params) => {
			this.selectedYear = +params['year'];
			this.selectedSemester = +params['semester'];
			this.selectedCurriculum = +params['curriculum'];
			this.section = +params['section'];
			this.subjectId = params['subjectId'];

			console.log('From Subject Detail Page');
			console.log(`
				selectedYear = ${this.selectedYear},
				selectedSemester = ${this.selectedSemester},
				selectedCurriculum = ${this.selectedCurriculum},
				section = ${this.section},
				subjectId = ${this.subjectId}
			`);

			if (
				(this.selectedYear === -1 || isNaN(this.selectedYear)) &&
				(this.selectedSemester === -1 || isNaN(this.selectedSemester)) &&
				(this.selectedCurriculum === -1 || isNaN(this.selectedCurriculum)) &&
				(this.section === -1 || isNaN(this.section)) &&
				(this.subjectId !== '' || this.subjectId !== undefined)
			) {
				this.getSubjectsDataBySubjectId();
			} else if (!isNaN(this.selectedYear) && !isNaN(this.selectedSemester) && !isNaN(this.selectedCurriculum) && this.subjectId !== '' && !isNaN(this.section)) {
				this.getEachSubjectData();
			}
			this.getSubjectReviews();
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	get paginationType() {
		return paginationType;
	}

	public getEachSubjectData() {
		this.apiManagementService.GetSubjectsDataBySection(this.selectedYear - 543, this.selectedSemester, this.selectedCurriculum, this.subjectId, this.section.toString()).subscribe({
			next: (res) => {
				if (res) {
					this.eachSubjectData = res;
					console.log('eachSubjectData : ', this.eachSubjectData);
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
					console.error('An unexpected error occurred:', error.status);
				}
			},
		});
	}

	public getSubjectsDataBySubjectId() {
		this.apiManagementService.GetSubjectsDataBySubjectId(this.subjectId).subscribe({
			next: (res) => {
				if (res) {
					this.subjectData = res;
					console.log('subjectData : ', this.subjectData);
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
					console.error('An unexpected error occurred:', error.status);
				}
			},
		});
	}

	public getSubjectReviews() {
		this.isLoadingReview = true;
		console.log('Loading:', this.isLoadingReview);
		this.apiManagementService.GetSubjectReviewsBySubjectID(this.subjectId).subscribe({
			next: (res) => {
				if (res) {
					this.subjectReviewData = res;
					console.log('subjectReviewData  : ', this.subjectReviewData);
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
					console.error('An unexpected error occurred:', error.status);
				}
				this.isLoadingReview = false;
			},
		});
	}
}
