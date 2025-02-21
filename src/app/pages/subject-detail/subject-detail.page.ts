import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from '@models/Subject.model';
import { Transcript } from '@models/Transcript.model';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { initFlowbite } from 'flowbite';
import { finalize } from 'rxjs';
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

	public signedIn: boolean = false;
	public currentUser: User | null = null;
	public transcript: Transcript | null = null;

	public selectedYear: number = -1;
	public selectedSemester: number = -1;
	public selectedCurriculum: number = -1;
	public subjectId: string = '';
	public section: number = -1;

	public avgReviewRating: number = 4;
	public reviewCount: number = 30;

	public isLoadingReview: boolean = false;
	public isLoadingTranscript: boolean = false;
	public canReview: boolean = false;
	public isSubjectCompleted: boolean = false;
	public notHaveTranscript: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private apiManagementService: APIManagementService,
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
		private loadingService: LoadingService,
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
			this.route.params.subscribe((params) => {
				this.selectedYear = +params['year'];
				this.selectedSemester = +params['semester'];
				this.selectedCurriculum = +params['curriculum'];
				this.section = +params['section'];
				this.subjectId = params['subjectId'];

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
				this.fetchTranscripts();
				this.getSubjectReviews();
			});
		});
		console.log('currentUser in ngOnInIt : ', this.currentUser);
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	fetchTranscripts() {
		console.log('currentUser in fetch Transcript : ', this.currentUser);
		this.isLoadingTranscript = true;
		if (!this.currentUser) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get-by-user/${this.currentUser.id}`;
		this.http
			.get<Transcript>(apiUrl)
			.pipe(
				finalize(() => {
					this.loadingService.hide();
				}),
			)
			.subscribe({
				next: (data) => {
					this.transcript = data;
					if (data) {
						this.hasTranscript = true;
					} else {
						this.hasTranscript = false;
					}

					this.checkReviewSubject();
					this.updateWriteReviewPermission();
					this.isLoadingTranscript = false;
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
					this.hasTranscript = false;
				},
			});
	}

	public hasTranscript: boolean = false;
	public hasCompletedSubject: boolean = false;
	public completedSubjectDetails: { year: number | null; term: number | null } | null = null;

	public checkReviewSubject() {
		if (!this.transcript || !this.currentUser) {
			this.hasCompletedSubject = false;
			this.completedSubjectDetails = null;
			return;
		}
		const completedSubject = this.transcript.details.find((detail) => detail.subject?.id === this.subjectId && detail.grade && detail.grade.toUpperCase() !== 'X');

		if (completedSubject) {
			this.hasCompletedSubject = true;
			this.completedSubjectDetails = {
				year: completedSubject.teachtable?.year ? completedSubject.teachtable.year + 543 : null,
				term: completedSubject.teachtable?.term ?? null,
			};
			if (!this.completedSubjectDetails?.year && !this.completedSubjectDetails?.term) {
				this.completedSubjectDetails = null;
			}
		} else {
			this.hasCompletedSubject = false;
			this.completedSubjectDetails = null;
		}
	}

	public updateWriteReviewPermission() {
		if (this.signedIn && this.hasTranscript && this.hasCompletedSubject && this.completedSubjectDetails) {
			this.canReview = true;
		} else if (this.signedIn && this.hasTranscript && !this.hasCompletedSubject) {
			this.isSubjectCompleted = true;
		} else if (this.signedIn && !this.hasTranscript) {
			this.notHaveTranscript = true;
		}
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
