import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Transcript } from '@models/Transcript.model.js';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';
import { User } from '@models/User.model.js';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { SDMBaseAccordion } from '../accordion/base-accordion.component';

@Component({
	selector: 'sdm-transcript-tracker',
	imports: [CommonModule, SDMBaseAccordion],
	templateUrl: './transcript-tracker.component.html',
	styleUrl: './transcript-tracker.component.css',
})
export class SDMTranscriptTrackerComponent {
	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private loadingService: LoadingService,
	) {}

	currentUser: User | null = null;
	transcript: Transcript | null = null;

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
		});
		this.fetchTranscripts();
	}

	fetchTranscripts() {
		if (!this.currentUser) return;

		this.isFetchingTranscriptDetails = true;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get-by-user/${this.currentUser.id}`;
		this.http
			.get<Transcript>(apiUrl)
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

	getFirstNonZeroYearIndex(): number {
		return this.groupedTranscriptDetails.findIndex((detail) => detail.year !== 0);
	}
}
