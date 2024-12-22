import {
	Component,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { SDMSelectComponent } from '../select/select.component';
import { ratingList } from './review-filter-data';
import { SelectedData } from '../../shared/models/SdmAppService.model';
import { CommonModule } from '@angular/common';
import { SDMSubjectReviewComponent } from '../subject-review/subject-review.component';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';

@Component({
	selector: 'sdm-review-filter',
	standalone: true,
	imports: [SDMSelectComponent, CommonModule, SDMSubjectReviewComponent],
	templateUrl: './review-filter.component.html',
	styleUrl: './review-filter.component.css',
})
export class SDMReviewFilterComponent {
	@Input() subjectReviewData?: SubjectReviewData[];

	@ViewChild(SDMSelectComponent) sdmSelect!: SDMSelectComponent;

	public ratingList = ratingList;

	public selectedPopular: boolean = false;
	public selectedLatest: boolean = false;
	public selectedRating: boolean = false;

	public selectedStarRatingValue: any;

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
	}

	public onLatestFilterChange() {
		this.selectedLatest = !this.selectedLatest;
		this.resetOtherFilters('latest');
	}

	public onRatingFilterChange(selectedRatingData: SelectedData) {
		this.selectedStarRatingValue = selectedRatingData.value;
		if (this.selectedStarRatingValue) {
			this.selectedRating = true;
			this.resetOtherFilters('starRating');
		} else {
			this.selectedRating = false;
		}
	}
}
