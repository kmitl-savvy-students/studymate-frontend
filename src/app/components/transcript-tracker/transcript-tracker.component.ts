import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Transcript } from '@models/Transcript.model.js';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';
import { User } from '@models/User.model.js';
import { SDMAccordionComponent } from '../accordion/accordion.component';

@Component({
	selector: 'sdm-transcript-tracker',
	imports: [CommonModule, SDMAccordionComponent],
	templateUrl: './transcript-tracker.component.html',
	styleUrl: './transcript-tracker.component.css',
})
export class SDMTranscriptTrackerComponent implements OnInit {
	@Input() currentUser: User | null = null;
	@Input() isFetchingTranscriptDetails: boolean = false;
	@Input() transcriptData: Transcript | null = null;
	@Input() groupedTranscriptDetails: { year: number; term: number; details: Array<TranscriptDetail> }[] = [];
	public isFirtstSubject: boolean = false;
	ngOnInit(): void {
		// console.log('group', this.groupedTranscriptDetails);
	}

	getFirstNonZeroYearIndex(): number {
		return this.groupedTranscriptDetails.findIndex((detail) => detail.year !== 0);
	}
}
