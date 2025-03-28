import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CurriculumGroup } from '@models/CurriculumGroup.model';
import { Transcript } from '@models/Transcript.model';
import { TranscriptDetail } from '@models/TranscriptDetail.model';
import { User } from '@models/User.model';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-curriculum-progress-tracker',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './curriculum-progress-tracker.page.html',
})
export class SDMPageCurriculumProgressTracker implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private loadingService: LoadingService,
	) {}

	currentUser: User | null = null;
	transcript: Transcript | null = null;

	openAccordions: Set<number> = new Set<number>();

	groupMatches = new Map<number, TranscriptDetail[]>();

	groupCreditUsed = new Map<number, number>();

	groupCreditRequired = new Map<number, number>();

	groupComplete = new Map<number, boolean>();

	notFittedSubjects: TranscriptDetail[] = [];

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
		this.fetchTranscripts();
	}

	toggleAccordion(groupId: number) {
		if (this.openAccordions.has(groupId)) {
			this.openAccordions.delete(groupId);
		} else {
			this.openAccordions.add(groupId);
		}
	}

	isAccordionOpen(groupId: number): boolean {
		return this.openAccordions.has(groupId);
	}

	fetchTranscripts() {
		if (!this.currentUser) return;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get-by-user/${this.currentUser.id}`;
		this.http
			.get<Transcript>(apiUrl)
			.pipe(finalize(() => this.loadingService.hide()))
			.subscribe({
				next: (data) => {
					this.transcript = data;
					this.assignSubjectsToGroups();
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
				},
			});
	}

	private collectAllGroupIds(group: CurriculumGroup): void {
		this.openAccordions.add(group.id);
		for (const child of group.children || []) {
			this.collectAllGroupIds(child);
		}
	}

	assignSubjectsToGroups(): void {
		if (!this.transcript?.details || !this.currentUser?.curriculum?.curriculum_group) {
			this.notFittedSubjects = [];
			return;
		}
		this.groupMatches.clear();
		this.groupCreditUsed.clear();
		this.groupCreditRequired.clear();
		this.groupComplete.clear();

		this.collectAllGroupIds(this.currentUser.curriculum.curriculum_group);

		this.computeRequiredCredits(this.currentUser.curriculum.curriculum_group);

		const used = new Set<TranscriptDetail>();
		this.processGroup(this.currentUser.curriculum.curriculum_group, used);

		this.notFittedSubjects = this.transcript.details.filter((d) => !used.has(d));
	}

	private computeRequiredCredits(group: CurriculumGroup): number {
		let required = 0;

		if (group.children?.length) {
			for (const child of group.children) {
				required += this.computeRequiredCredits(child);
			}
		}

		if ((group.type === 'REQUIRED_ALL' || group.credit === 0) && group.subjects?.length) {
			let sumOfSubjectCredits = 0;
			for (const gs of group.subjects) {
				if (gs.subject) {
					sumOfSubjectCredits += gs.subject.credit;
				}
			}
			required += sumOfSubjectCredits;
		} else if (group.type === 'FREE' || group.type === 'REQUIRED_CREDIT') {
			required += group.credit || 0;
		} else if (group.credit && !group.children?.length) {
			required += group.credit;
		}

		this.groupCreditRequired.set(group.id, required);
		return required;
	}

	private processGroup(group: CurriculumGroup, used: Set<TranscriptDetail>): { used: number; complete: boolean } {
		this.groupMatches.set(group.id, []);
		this.groupCreditUsed.set(group.id, 0);
		this.groupComplete.set(group.id, false);

		let totalUsed = 0;
		let allChildrenComplete = true;

		if (group.children?.length) {
			for (const child of group.children) {
				const childResult = this.processGroup(child, used);
				totalUsed += childResult.used;
				if (!childResult.complete) {
					allChildrenComplete = false;
				}
			}
		}

		const needed = this.groupCreditRequired.get(group.id) || 0;

		switch (group.type) {
			case 'REQUIRED_ALL':
				if (group.subjects?.length) {
					for (const detail of this.transcript!.details) {
						if (used.has(detail)) continue;
						if (detail.grade === 'F' || detail.grade === 'U') continue;

						if (detail.subject) {
							const match = group.subjects.find((gs) => gs.subject?.id === detail.subject?.id);
							if (match) {
								this.groupMatches.get(group.id)?.push(detail);
								used.add(detail);
								totalUsed += detail.subject.credit;
							}
						}
					}
				}
				break;

			case 'REQUIRED_CREDIT':
				if (group.subjects?.length) {
					for (const detail of this.transcript!.details) {
						if (totalUsed >= needed) break;
						if (used.has(detail)) continue;
						if (detail.grade === 'F' || detail.grade === 'U') continue;

						if (detail.subject) {
							const match = group.subjects.find((gs) => gs.subject?.id === detail.subject?.id);
							if (match) {
								const c = detail.subject.credit;
								if (totalUsed + c <= needed) {
									this.groupMatches.get(group.id)?.push(detail);
									used.add(detail);
									totalUsed += c;
								}
							}
						}
					}
				}
				break;

			case 'FREE':
				for (const detail of this.transcript!.details) {
					if (totalUsed >= needed) break;
					if (used.has(detail)) continue;
					if (detail.grade === 'F' || detail.grade === 'U') continue;

					if (detail.subject) {
						const c = detail.subject.credit;
						if (totalUsed + c <= needed) {
							this.groupMatches.get(group.id)?.push(detail);
							used.add(detail);
							totalUsed += c;
						}
					}
				}
				break;

			default:
				break;
		}

		this.groupCreditUsed.set(group.id, totalUsed);

		let groupIsComplete = false;
		if (group.children?.length) {
			switch (group.type) {
				case 'REQUIRED_ALL':
					if (allChildrenComplete) {
						groupIsComplete = true;
					}
					break;
				case 'REQUIRED_CREDIT':
				case 'FREE':
					if (totalUsed >= needed) {
						groupIsComplete = true;
					}
					break;
				default:
					groupIsComplete = allChildrenComplete;
					break;
			}
		} else {
			switch (group.type) {
				case 'REQUIRED_ALL':
					if (group.subjects?.length) {
						const matched = this.groupMatches.get(group.id) || [];
						if (matched.length === group.subjects.length) {
							groupIsComplete = true;
						}
					} else {
						groupIsComplete = true;
					}
					break;

				case 'REQUIRED_CREDIT':
				case 'FREE':
					if (totalUsed >= needed) {
						groupIsComplete = true;
					}
					break;

				default:
					break;
			}
		}

		this.groupComplete.set(group.id, groupIsComplete);
		return { used: totalUsed, complete: groupIsComplete };
	}
}
