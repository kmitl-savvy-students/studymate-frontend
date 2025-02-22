import { Component } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMfilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { paginationType } from '../../shared/models/SdmAppService.model';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { User } from '../../shared/models/User.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [SDMReviewFilterComponent, SDMfilterBarComponent],
	templateUrl: './review.page.html',
})
export class SDMPageReview {
	public reviewData: SubjectReviewData[] = [];
	public currentYearTermReviewData: SubjectReviewData[] = [];

	public signedIn: boolean = false;
	public currentUser: User | null = null;

	public isLoadingReview: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthenticationService,
	) {}

	ngOnInit(): void {
		this.authService.signedIn$.subscribe((signedIn) => {
			this.signedIn = signedIn;
		});
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			this.getCurrentYearTermReview();
		});
		this.getSubjectReviews();
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	get paginationType() {
		return paginationType;
	}

	public getSubjectReviews() {
		this.isLoadingReview = true;
		this.apiManagementService.GetAllSubjectReviews().subscribe({
			next: (res) => {
				if (res) {
					this.reviewData = res;
				} else {
					console.log('No allReview Data Available.');
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

	public getCurrentYearTermReview() {
		if (this.currentUser) {
			this.apiManagementService.GetSubjectReviewsCurrentYearTerm().subscribe({
				next: (res) => {
					if (res) {
						this.currentYearTermReviewData = res;
					} else {
						console.log('No currentReview Data Available.');
					}
				},
				error: (error) => {
					if (error.status === 404) {
						console.error('Not found!!!!!!!');
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error('An unexpected error occurred:', error.status);
					}
				},
			});
		}
	}
}
