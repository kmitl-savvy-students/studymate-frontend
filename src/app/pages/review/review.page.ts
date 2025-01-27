import { Component, SimpleChanges } from '@angular/core';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { initFlowbite } from 'flowbite';
import { APIManagementService } from '../../shared/services/api-management.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';
import { paginationType } from '../../shared/models/SdmAppService.model';

@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [SDMReviewFilterComponent],
	templateUrl: './review.page.html',
})
export class SDMPageReview {
	public reviewData: SubjectReviewData[] = [];

	public isLoadingReview: boolean = false;

	public signedIn: boolean = false;
	public currentUser: User | null = null;

	constructor(
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
					console.log('No Reviews Data Available.');
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
