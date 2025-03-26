import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SDMBaseAccordion } from '@components/accordion/base-accordion.component.js';
import { Transcript } from '@models/Transcript.model.js';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';
import { User } from '@models/User.model.js';
import { APIManagementService } from '@services/api-management.service.js';
import { AuthenticationService } from '@services/authentication/authentication.service.js';
import { LoadingService } from '@services/loading/loading.service.js';
import { finalize } from 'rxjs';
import { SDMBaseModal } from '../modals/base-modal.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';

@Component({
	selector: 'sdm-transcript-tracker',
	imports: [CommonModule, SDMBaseAccordion, SDMSubjectListCardComponent, SDMBaseModal, FormsModule],
	templateUrl: './transcript-tracker.component.html',
	styleUrl: './transcript-tracker.component.css',
})
export class SDMTranscriptTrackerComponent implements OnInit, AfterViewInit {
	@ViewChild('policyModal') policyModal!: SDMBaseModal;
	constructor(
		private authService: AuthenticationService,
		private loadingService: LoadingService,
		private apiManagementService: APIManagementService,
	) {}

	currentUser: User | null = null;
	transcript: Transcript | null = null;
	isChecked: boolean = false;

	isFetchingTranscriptDetails: boolean = false;
	groupedTranscriptDetails: { year: number; term: number; details: Array<TranscriptDetail> }[] = [];

	@ViewChildren(SDMBaseAccordion) allAccordions!: QueryList<SDMBaseAccordion>;

	private refreshAccordions() {
		this.allAccordions.forEach((accordion) => {
			accordion.initAccordion();
		});
	}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			this.fetchTranscripts();
			this.isChecked = !!this.currentUser?.view_policy;
		});
	}

	ngAfterViewInit() {
		if (!this.isChecked) {
			this.policyModal.show();
		}
	}

	onClosePolicy() {
		if (this.isChecked) {
			this.apiManagementService.UpdateUserPolicy(this.currentUser?.id).subscribe({
				next: () => {
					console.error('success');
				},
				error: (error) => {
					console.error('Error updating curriculum:', error);
				},
			});
			this.policyModal.hide();
		} else {
			const agreeDiv = document.querySelector('.argee') as HTMLElement;
			agreeDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	fetchTranscripts() {
		if (!this.currentUser) return;
		this.isFetchingTranscriptDetails = true;
		this.apiManagementService
			.FetchTranscript(this.currentUser.id)
			.pipe(
				finalize(() => {
					this.loadingService.hide();
					this.isFetchingTranscriptDetails = false;
				}),
			)
			.subscribe({
				next: (data) => {
					this.transcript = data;
					if (data !== null) {
						this.prepareAndSortTranscriptDetails(data.details);
					}
					this.refreshAccordions();
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
				},
			});
	}

	prepareAndSortTranscriptDetails(data: Array<TranscriptDetail>) {
		if (!this.transcript) return;
		this.transcript.details = data.sort((a, b) => {
			if (b.teachtable?.year !== a.teachtable?.year) {
				return (a.teachtable?.year ?? 0) - (b.teachtable?.year ?? 0);
			}
			if (b.teachtable?.term !== a.teachtable?.term) {
				return (a.teachtable?.term ?? 0) - (b.teachtable?.term ?? 0);
			}
			return a.subject?.id.localeCompare(b.subject?.id ?? '') ?? 0;
		});
		this.groupedTranscriptDetails = [];
		this.transcript.details.forEach((transcriptDetails) => {
			let group = this.groupedTranscriptDetails.find((g) => g.year === (transcriptDetails.teachtable?.year ?? 0) && g.term === (transcriptDetails.teachtable?.term ?? 0));
			if (!group) {
				group = { year: transcriptDetails.teachtable?.year ?? 0, term: transcriptDetails.teachtable?.term ?? 0, details: [] };
				this.groupedTranscriptDetails.push(group);
			}
			group.details.push(transcriptDetails);
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['groupedTranscriptDetails'] && changes['groupedTranscriptDetails'].currentValue) {
			console.log('group', changes['groupedTranscriptDetails'].currentValue);
			this.groupedTranscriptDetails = changes['groupedTranscriptDetails'].currentValue;
			this.isFetchingTranscriptDetails = changes['isFetchingTranscriptDetails'].currentValue;
		}
	}

	getFirstNonZeroYearIndex(): number {
		return this.groupedTranscriptDetails.findIndex((detail) => detail.year !== 0);
	}
}
