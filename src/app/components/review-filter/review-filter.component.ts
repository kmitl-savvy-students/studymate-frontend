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
import {
	paginationType,
	SelectedData,
} from '../../shared/models/SdmAppService.model';
import { CommonModule } from '@angular/common';
import { SDMSubjectReviewComponent } from '../subject-review/subject-review.component';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMPaginationComponent } from '../pagination/pagination.component';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';
import { SDMSearchBarComponent } from '../search-bar/search-bar.component';

@Component({
	selector: 'sdm-review-filter',
	standalone: true,
	imports: [
		SDMSelectComponent,
		CommonModule,
		SDMSubjectReviewComponent,
		SDMPaginationComponent,
		SDMSearchBarComponent,
	],
	templateUrl: './review-filter.component.html',
	styleUrl: './review-filter.component.css',
})
export class SDMReviewFilterComponent implements OnChanges {
	@ViewChild(SDMSelectComponent) sdmSelect!: SDMSelectComponent;

	@Input() subjectReviewData: SubjectReviewData[] = [];
	@Input() currentYearTermReviewData: SubjectReviewData[] = [];

	@Input() isLoadingReview: boolean = false;
	@Input() paginationType!: number;
	@Input() signedIn: boolean = false;
	@Input() currentUser: User | null = null;
	@Input() prioritizeUserReview: boolean = false;
	@Input() itemsPerPage: number = 10;
	@Input() isShowSearchBar: boolean = false;
	@Input() isReviewPage: boolean = false;

	@Output() confirmEditReview = new EventEmitter<void>();
	@Output() deleteUserReview = new EventEmitter<void>();

	public ratingList = ratingList;

	public selectedPopular: boolean = false;
	public selectedLatest: boolean = false;
	public selectedRating: boolean = false;
	public selectedCurrentYearTerm: boolean = false;

	public selectedStarRatingValue: any;

	public searchedReviewDataList: SubjectReviewData[] = [];
	public currentPage: number = 1;
	public paginatedItems: SubjectReviewData[] = [];
	public subjectReviewTotal: number = 0;

	public filterItems: SubjectReviewData[] = [];
	public dataToPaginate: SubjectReviewData[] = [];

	public getSubjectReviewIsNull: boolean = false;
	public filterReviewIsNull: boolean = false;
	public searchReviewDataIsNull: boolean = false;

	public isSearched: boolean = false;
	public isReviewCreator: boolean = false;
	public isEditingReview: boolean = false;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['subjectReviewData']) {
			this.getSubjectReviewIsNull = this.subjectReviewData.length === 0;
			this.filterData();
			this.updatePaginatedItems();
		}
	}

	get paginationTypes() {
		return paginationType;
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
				this.selectedCurrentYearTerm = false;
				break;
			case 'latest':
				this.selectedPopular = false;
				this.clearSelect();
				this.selectedCurrentYearTerm = false;
				break;
			case 'starRating':
				this.selectedPopular = false;
				this.selectedLatest = false;
				this.selectedCurrentYearTerm = false;
				break;
			case 'currentYearTerm':
				this.selectedLatest = false;
				this.selectedPopular = false;
				this.clearSelect();
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

	public onCurrentYearTermFilterChange() {
		this.selectedCurrentYearTerm = !this.selectedCurrentYearTerm;
		this.resetOtherFilters('currentYearTerm');
		this.currentPage = 1;
		this.filterData();
	}

	public filterData(): void {
		const dataToFilter = this.isSearched
			? this.searchedReviewDataList
			: this.subjectReviewData;
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
		} else if (this.selectedCurrentYearTerm) {
			console.log('please do something about this filter');
		} else {
			this.filterItems = dataToFilter;
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
		this.dataToPaginate = this.filterItems;
		this.paginatedItems = this.dataToPaginate.slice(start, end);
		this.subjectReviewTotal = this.dataToPaginate.length;
		this.filterReviewIsNull = this.dataToPaginate.length === 0;
	}

	public onEditReview(isEditingReview: boolean) {
		this.isEditingReview = isEditingReview;
	}

	public onConfirmEditReview() {
		this.confirmEditReview.emit();
	}

	public onDeleteUserReview() {
		this.deleteUserReview.emit();
	}

	public getSearchedReviewsDataList(
		searchedReviewDataList: SubjectReviewData[],
	) {
		this.searchedReviewDataList = searchedReviewDataList;
		this.isSearched = true;
		this.currentPage = 1;
		this.filterData();
	}

	public searchFunction(
		data: SubjectReviewData[],
		searchValue: string,
	): SubjectReviewData[] {
		return data.filter(
			(review) =>
				review.teachtable_subject.subject_id
					.toLowerCase()
					.includes(searchValue.toLowerCase()) ||
				review.subject_name_en
					.toLowerCase()
					.includes(searchValue.toLowerCase()),
		);
	}
}
