import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transcript } from '@models/Transcript.model.js';
import { TranscriptDetail } from '@models/TranscriptDetail.model.js';
import { User } from '@models/User.model.js';
import { AlertService } from '@services/alert/alert.service';
import { APIManagementService } from '@services/api-management.service.js';
import { AuthenticationService } from '@services/authentication/authentication.service.js';
import { finalize } from 'rxjs';
import { SDMBaseButton } from '../buttons/base-button.component';

function getGradeValue(grade: string): number {
	switch (grade.toUpperCase()) {
		case 'A':
			return 4.0;
		case 'B+':
			return 3.5;
		case 'B':
			return 3.0;
		case 'C+':
			return 2.5;
		case 'C':
			return 2.0;
		case 'D+':
			return 1.5;
		case 'D':
			return 1.0;
		case 'F':
			return 0.0;
		default:
			return -1;
	}
}

interface YearTermGroup {
	year: number;
	term: number;
	details: TranscriptDetail[];
	gps: number;
	gpa: number;
}

@Component({
	selector: 'sdm-grade-tracker',
	standalone: true,
	imports: [CommonModule, FormsModule, SDMBaseButton],
	templateUrl: './grade-tracker.component.html',
})
export class SDMGradeTrackerComponent implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private alertService: AlertService,
		private apiManagementService: APIManagementService,
	) {}

	currentUser: User | null = null;
	transcript: Transcript | null = null;
	isFetchingTranscript = false;

	groupedTranscriptDetails: YearTermGroup[] = [];
	private originalGrades = new Map<number, string>();

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			this.fetchTranscript();
		});
	}

	fetchTranscript(): void {
		if (!this.currentUser) return;
		this.isFetchingTranscript = true;
		this.apiManagementService
			.FetchTranscript(this.currentUser.id)
			.pipe(finalize(() => (this.isFetchingTranscript = false)))
			.subscribe({
				next: (transcript) => {
					this.transcript = transcript;
					if (transcript?.details?.length) {
						for (const d of transcript.details) {
							this.originalGrades.set(d.id, d.grade || '');
						}
						this.prepareAndGroupTranscriptDetails(transcript.details);
					} else {
						this.groupedTranscriptDetails = [];
					}
				},
				error: (err) => {
					console.error('Error fetching transcript:', err);
				},
			});
	}

	prepareAndGroupTranscriptDetails(details: TranscriptDetail[]): void {
		details.sort((a, b) => {
			const ay = a.teachtable?.year ?? 0;
			const by = b.teachtable?.year ?? 0;
			if (ay !== by) return ay - by;

			const at = a.teachtable?.term ?? 0;
			const bt = b.teachtable?.term ?? 0;
			if (at !== bt) return at - bt;

			const aId = a.subject?.id || '';
			const bId = b.subject?.id || '';
			return aId.localeCompare(bId);
		});

		const map = new Map<string, YearTermGroup>();
		for (const detail of details) {
			const y = detail.teachtable?.year ?? 0;
			const t = detail.teachtable?.term ?? 0;
			const key = `${y}-${t}`;
			if (!map.has(key)) {
				map.set(key, { year: y, term: t, details: [], gps: 0, gpa: 0 });
			}
			map.get(key)!.details.push(detail);
		}
		this.groupedTranscriptDetails = Array.from(map.values());
		this.calculateStatsWithCumulative();
	}

	calculateStatsWithCumulative(): void {
		let totalPointsSoFar = 0;
		let totalCreditsSoFar = 0;

		for (const group of this.groupedTranscriptDetails) {
			let termPoints = 0;
			let termCredits = 0;

			for (const detail of group.details) {
				const grade = (detail.grade || '').toUpperCase().trim();
				const val = getGradeValue(grade);
				const credit = detail.subject?.credit ?? 0;

				if (val < 0) continue;

				termCredits += credit;
				termPoints += credit * val;
			}

			group.gps = termCredits > 0 ? termPoints / termCredits : 0;

			totalPointsSoFar += termPoints;
			totalCreditsSoFar += termCredits;

			group.gpa = totalCreditsSoFar > 0 ? totalPointsSoFar / totalCreditsSoFar : 0;
		}
	}

	onGradeChange(detail: TranscriptDetail, newGrade: string): void {
		detail.grade = newGrade.trim();
		this.calculateStatsWithCumulative();
	}

	onResetAllGrades(): void {
		if (!this.transcript) return;
		for (const detail of this.transcript.details) {
			const orig = this.originalGrades.get(detail.id) || '';
			detail.grade = orig;
		}
		this.alertService.showAlert('success', 'รีเซ็ตเกรดเป็นค่าเริ่มต้นสำเร็จ!');
		this.calculateStatsWithCumulative();
	}
}
