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
}
