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
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';
import { paginationType } from '../../shared/models/SdmAppService.model';
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
	public eachSubjectData: SubjectCardData[] = [];
	public subjectDetail!: subjectDetailData;
	public subjectReviewData: SubjectReviewData[] = [];

	public isLoadingReview: boolean = false;

	public signedIn: boolean = false;
	public currentUser: User | null = null;

	public selectedYear: number = 0;
	public selectedSemester: number = 0;
	public selectedFaculty: string = '';
	public selectedDepartment: string = '';
	public selectedCurriculum?: string = '';
	public selectedClassYear: number = -1;
	public selectedCurriculumYear?: string = '';
	public selectedUniqueId?: string = '';
	public subjectId: string = '';
	public section: number = 0;

	public subjectIdFromParams: string = '';

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

		this.route.params.subscribe((params) => {
			this.selectedYear = +params['year'];
			this.selectedSemester = +params['semester'];
			this.selectedFaculty = params['faculty'];
			this.selectedDepartment = params['department'];
			this.selectedCurriculum = params['curriculum'];
			this.selectedClassYear = +params['classYear'];
			this.selectedCurriculumYear = params['curriculumYear'];
			this.selectedUniqueId = params['uniqueId'];
			this.section = params['section'];
			this.subjectId = params['subjectId'];

			console.log('From Subject Detail Page');
			console.log(`
				selectedYear = ${this.selectedYear},
				selectedSemester = ${this.selectedSemester},
				selectedFaculty = ${this.selectedFaculty},
				selectedDepartment = ${this.selectedDepartment},
				selectedCurriculum = ${this.selectedCurriculum},
				selectedClassYear = ${this.selectedClassYear},
				selectedCurriculumYear = ${this.selectedCurriculumYear},
				selectedUniqueId = ${this.selectedUniqueId},
				section = ${this.section},
				subjectId = ${this.subjectId}
			`);
			console.log(
				this.selectedYear &&
					this.selectedSemester !== undefined &&
					this.selectedFaculty !== undefined &&
					this.selectedDepartment !== undefined &&
					this.selectedCurriculum !== undefined &&
					this.selectedClassYear !== undefined &&
					this.section !== undefined &&
					this.subjectId !== undefined &&
					this.selectedYear !== 0 &&
					this.selectedSemester !== 0 &&
					this.selectedFaculty !== '' &&
					this.selectedDepartment !== '' &&
					this.selectedCurriculum !== '' &&
					this.selectedClassYear !== -1 &&
					this.section !== 0,
			);

			if (
				this.selectedYear &&
				this.selectedSemester !== undefined &&
				this.selectedFaculty !== undefined &&
				this.selectedDepartment !== undefined &&
				this.selectedCurriculum !== undefined &&
				this.selectedClassYear !== undefined &&
				this.section !== undefined &&
				this.subjectId !== undefined &&
				this.selectedYear !== 0 &&
				this.selectedSemester !== 0 &&
				this.selectedFaculty !== '' &&
				this.selectedDepartment !== '' &&
				this.selectedCurriculum !== '' &&
				this.selectedClassYear !== -1 &&
				this.section !== 0
			) {
				this.getEachSubjectData();
			}

			this.getSubjectDetail();
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
		this.apiManagementService
			.GetEachSubjectData(
				this.selectedYear,
				this.selectedSemester,
				this.selectedFaculty,
				this.selectedDepartment,
				this.selectedCurriculum!,
				this.selectedClassYear,
				this.subjectId,
				this.section,
				this.selectedCurriculumYear,
				this.selectedUniqueId,
			)
			.subscribe({
				next: (res) => {
					if (res && res.length === 1) {
						this.eachSubjectData = res;
						console.log(
							'eachSubjectData in subject-detail.page : ',
							this.eachSubjectData,
						);
						console.log(this.eachSubjectData[0].subject_id);
						console.log('getEachSubjectData เสร็จแล้วจ้า');
					} else {
						this.router.navigate(['/subject']);
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

	public getSubjectDetail() {
		this.apiManagementService
			.GetCurriculumTeachtableSubject(this.subjectId)
			.subscribe({
				next: (res) => {
					if (res) {
						this.subjectDetail = res;
						console.log('subjectDetail : ', this.subjectDetail);
						console.log('getSubjectDetail เสร็จแล้วจ้า');
					} else {
						this.router.navigate(['/subject']);
						console.log('No Subject Data Available.');
					}
				},
				error: (error) => {
					if (error.status === 400) {
						this.router.navigate(['/subject']);
					} else if (error.status === 404) {
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
		console.log('Loading:', this.isLoadingReview);
		this.apiManagementService
			.GetSubjectReviewsBySubjectID(this.subjectId)
			.subscribe({
				next: (res) => {
					if (res) {
						this.subjectReviewData = res;
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
