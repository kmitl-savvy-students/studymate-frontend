import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { SDMSelectComponent } from '../select/select.component';
import { ratingList } from './review-filter-data';
import { SelectedData } from '../../shared/models/SdmAppService.model';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-review-filter',
	standalone: true,
	imports: [SDMSelectComponent, CommonModule],
	templateUrl: './review-filter.component.html',
	styleUrl: './review-filter.component.css',
})
export class SDMReviewFilterComponent {
	public ratingList = ratingList;
	public selectedPopular: boolean = false;
	public selectedLatest: boolean = false;
	public selectedStarRating: any = null;

	@ViewChild(SDMSelectComponent) sdmSelect!: SDMSelectComponent;

	@Output() selectedPopularValue = new EventEmitter<boolean>();
	@Output() selectedLatestValue = new EventEmitter<boolean>();
	@Output() selectedRatingValue = new EventEmitter<{
		label: string;
		index?: number;
		value?: any;
	}>();

	private resetOtherFilters(filter: string) {
		if (filter === 'popular') {
			this.selectedLatest = false;
			this.clearSelect();
		} else if (filter === 'latest') {
			this.selectedPopular = false;
			this.clearSelect();
		} else if (filter === 'starRating') {
			this.selectedPopular = false;
			this.selectedLatest = false;
		}
	}

	private clearSelect() {
		if (this.sdmSelect) {
			this.sdmSelect.onSelectedOption('');
		}
	}

	public onPopularFilterChange() {
		this.selectedPopularValue.emit(this.selectedPopular);
	}

	public onLatestFilterChange() {
		this.selectedLatestValue.emit(this.selectedLatest);
	}

	public onRatingFilterChange(selectedRatingData: SelectedData) {
		this.selectedStarRating = selectedRatingData;
		this.selectedRatingValue.emit(selectedRatingData);
	}

	public togglePopular() {
		this.selectedPopular = !this.selectedPopular;
		this.resetOtherFilters('popular');
		this.onPopularFilterChange();
	}

	public toggleLatest() {
		this.selectedLatest = !this.selectedLatest;
		this.resetOtherFilters('latest');
		this.onLatestFilterChange();
	}

	public toggleStarRating() {
		this.resetOtherFilters('starRating');
	}
}
