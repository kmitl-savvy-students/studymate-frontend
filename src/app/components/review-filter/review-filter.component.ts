import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { SDMSelectComponent } from '../select/select.component';
import { ratingList } from './review-filter-data';
import { SelectedData } from '../../shared/models/SdmAppService.model';
import { CommonModule } from '@angular/common';
import { SDMSubjectReviewComponent } from '../subject-review/subject-review.component';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMPaginationComponent } from '../pagination/pagination.component';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';

@Component({
	selector: 'sdm-review-filter',
	standalone: true,
	imports: [
		SDMSelectComponent,
		CommonModule,
		SDMSubjectReviewComponent,
		SDMPaginationComponent,
	],
	templateUrl: './review-filter.component.html',
	styleUrl: './review-filter.component.css',
})
export class SDMReviewFilterComponent implements OnChanges {
	@ViewChild(SDMSelectComponent) sdmSelect!: SDMSelectComponent;

	@Input() subjectReviewData: SubjectReviewData[] = [];
	@Input() isLoadingReview: boolean = false;
	@Input() paginationType: 'single' | 'double' = 'single';
	@Input() signedIn: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() prioritizeUserReview: boolean = false;

	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() deleteUserReview = new EventEmitter<void>();

	public ratingList = ratingList;

	public selectedPopular: boolean = false;
	public selectedLatest: boolean = false;
	public selectedRating: boolean = false;

	public selectedStarRatingValue: any;

	public currentPage: number = 1;
	public itemsPerPage: number = 5;
	public paginatedItems: SubjectReviewData[] = [];
	public subjectReviewTotal: number = 0;

	public filterItems: SubjectReviewData[] = [];

	public getSubjectReviewIsNull: boolean = false;
	public filterReviewIsNull: boolean = false;

	public isReviewCreator: boolean = false;

	ngOnChanges(changes: SimpleChanges): void {
		if (
			changes['subjectReviewData'] &&
			changes['subjectReviewData'].currentValue
		) {
			this.getSubjectReviewIsNull = this.subjectReviewData.length === 0;
			this.filterData();
			this.updatePaginatedItems();
		}
	}

	public isReviewOwner(reviewUserId: string): boolean {
		if (this.signedIn && this.currentUser) {
			return reviewUserId === this.currentUser.id;
		}
		return false;
	}

	private resetOtherFilters(filter: string) {
		switch (filter) {
			case 'popular':
				this.selectedLatest = false;
				this.clearSelect();
				break;
			case 'latest':
				this.selectedPopular = false;
				this.clearSelect();
				break;
			case 'starRating':
				this.selectedPopular = false;
				this.selectedLatest = false;
				break;
			default:
				break;
		}
	}

	private clearSelect() {
		if (this.sdmSelect) {
			this.sdmSelect.onSelectedOption('');
		}
	}

	public onPopularFilterChange() {
		this.selectedPopular = !this.selectedPopular;
		this.resetOtherFilters('popular');
		this.currentPage = 1;
		this.filterData();
	}

	public onLatestFilterChange() {
		this.selectedLatest = !this.selectedLatest;
		this.resetOtherFilters('latest');
		this.currentPage = 1;
		this.filterData();
	}

	public onRatingFilterChange(selectedRatingData: SelectedData) {
		this.selectedStarRatingValue = selectedRatingData.value;
		if (this.selectedStarRatingValue) {
			this.selectedRating = true;
			this.resetOtherFilters('starRating');
			this.currentPage = 1;
		} else {
			this.selectedRating = false;
		}
		this.filterData();
	}

	public filterData(): void {
		const dataToFilter = this.subjectReviewData;

		let userReview = null;

		if (
			this.prioritizeUserReview &&
			!this.selectedPopular &&
			!this.selectedLatest &&
			this.selectedStarRatingValue === undefined &&
			this.signedIn &&
			this.currentUser
		) {
			userReview = dataToFilter.find(
				(item) => item.user_id === this.currentUser?.id,
			);
		}

		if (this.selectedPopular) {
			this.filterItems = [...dataToFilter].sort(
				(a, b) => b.like - a.like,
			);
		} else if (this.selectedLatest) {
			this.filterItems = [...dataToFilter].sort(
				(a, b) =>
					new Date(b.created).getTime() -
					new Date(a.created).getTime(),
			);
		} else if (
			this.selectedRating &&
			this.selectedStarRatingValue !== undefined
		) {
			this.filterItems = dataToFilter.filter(
				(item) => item.rating === this.selectedStarRatingValue,
			);
		} else {
			this.filterItems = this.subjectReviewData;
		}

		if (userReview) {
			this.filterItems = [
				userReview,
				...this.filterItems.filter(
					(item) => item.user_id !== this.currentUser?.id,
				),
			];
		}
		this.updatePaginatedItems();
	}

	public changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	public updatePaginatedItems() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		const dataToPaginate = this.filterItems;
		this.paginatedItems = dataToPaginate.slice(start, end);
		this.subjectReviewTotal = dataToPaginate.length;
		this.filterReviewIsNull = dataToPaginate.length === 0;
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
	}

	public onDeleteUserReview() {
		this.deleteUserReview.emit();
	}
}
