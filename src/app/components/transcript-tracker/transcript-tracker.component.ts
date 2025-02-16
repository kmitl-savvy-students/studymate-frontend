import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Transcript } from '@models/Transcript.model.js';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';
import { User } from '@models/User.model.js';
import { SDMAccordionComponent } from '../accordion/accordion.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';

@Component({
	selector: 'sdm-transcript-tracker',
	imports: [CommonModule, SDMAccordionComponent, SDMSubjectListCardComponent],
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
