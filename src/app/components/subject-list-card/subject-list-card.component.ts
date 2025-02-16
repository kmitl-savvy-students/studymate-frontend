import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';

@Component({
	selector: 'sdm-subject-list-card',
	imports: [CommonModule],
	templateUrl: './subject-list-card.component.html',
	styleUrl: './subject-list-card.component.css',
})
export class SDMSubjectListCardComponent {
	@Input() transcriptDetails?: Array<TranscriptDetail> = [];
}
