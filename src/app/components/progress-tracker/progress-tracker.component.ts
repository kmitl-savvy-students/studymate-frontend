// progress-tracker.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SDMBaseModal } from '@components/modals/base-modal.component.js';
import { CurriculumGroup } from '@models/CurriculumGroup.model';
import { CurriculumGroupSubject } from '@models/CurriculumGroupSubject.js';
import { Subject } from '@models/Subject.model.js';
import { Transcript } from '@models/Transcript.model';
import { TranscriptDetail } from '@models/TranscriptDetail.model';
import { User } from '@models/User.model';
import { APIManagementService } from '@services/api-management.service.js';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';
import { SDMTotalCreditEarnComponent } from '../total-credit-earn/total-credit-earn.component';

@Component({
	selector: 'sdm-progress-tracker',
	standalone: true,
	imports: [CommonModule, SDMSubjectListCardComponent, SDMBaseButton, SDMTotalCreditEarnComponent, SDMBaseModal],
	templateUrl: './progress-tracker.component.html',
})
export class SDMProgressTrackerComponent implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private loadingService: LoadingService,
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	@ViewChild('showSubjectGroupModal') showSubjectGroupModal!: SDMBaseModal;

	currentUser: User | null = null;
	transcript: Transcript | null = null;
	rootNode: CurriculumGroup | null = null;

	openAccordions: Set<number> = new Set<number>();
	groupMatches = new Map<number, TranscriptDetail[]>();
	groupCreditUsed = new Map<number, number>();
	groupCreditRequired = new Map<number, number>();
	groupCreditTotal: number = 0;
	groupComplete = new Map<number, boolean>();
	progressPercentage: number = 0;

	notFittedSubjects: TranscriptDetail[] = [];

	subjectData!: Subject;
	currentSubjects: CurriculumGroupSubject[] = [];
	currentSubjectsGroupColor: string = '';

	accordionLevelExpands = 2;
	includeXGrade = false;

	isFetchingTranscriptDetails: boolean = false;

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			if (this.currentUser?.curriculum?.curriculum_group) {
				this.openAccordions.add(this.currentUser.curriculum.curriculum_group.id);
				this.expandAccordions(this.currentUser.curriculum.curriculum_group, this.accordionLevelExpands - 1);
			}
			this.fetchTranscripts();
		});
	}

	public toggleIncludeXGrade(): void {
		this.includeXGrade = !this.includeXGrade;
		this.assignSubjectsToGroups();
	}

	getSubjectDetailUrl(subjectData: string): string {
		const path = this.router.serializeUrl(this.router.createUrlTree(['/subject/subject-detail', subjectData]));
		return path;
	}

	expandAccordions(group: CurriculumGroup, levelLeft: number): void {
		if (levelLeft === 0) return;
		if (group.children && group.children.length > 0) {
			group.children.forEach((child) => {
				this.openAccordions.add(child.id);
				this.expandAccordions(child, levelLeft - 1);
			});
		}
	}

	collapseAllAccordions(): void {
		this.openAccordions.clear();
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

	findParentNodeColor(currentNode: CurriculumGroup): string {
		const GRAY = '#e7e5e4';
		if (currentNode.color?.toUpperCase() !== '#FFFFFF' && currentNode.color?.trim().length !== 0) {
			return currentNode.color;
		}
		const parentNode = this.findNodeById(currentNode.parent_id, this.rootNode);
		if (!parentNode) return GRAY;
		return this.findParentNodeColor(parentNode);
	}

	findNodeById(id: number, currentNode: CurriculumGroup | null): CurriculumGroup | null {
		if (!currentNode) return null;
		if (currentNode.id === id) return currentNode;
		for (const child of currentNode.children) {
			const result = this.findNodeById(id, child);
			if (result) return result;
		}
		return null;
	}

	onClickShowSubjectGroup(subjects: Array<CurriculumGroupSubject>, color: string) {
		this.currentSubjectsGroupColor = color;
		this.currentSubjects = subjects;
		this.showSubjectGroupModal.show();
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
					const gradeOrder = ['S', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'X'];

					// this.transcript.details = [...this.transcript.details].sort((a, b) => a.id - b.id);

					this.transcript.details.sort((a, b) => b.subject!.credit - a.subject!.credit);

					this.transcript.details.sort((a, b) => {
						return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
					});
					console.log(
						'after sort all :',
						this.transcript.details.map((d) => ({ id: d.subject!.id, credit: d.subject!.credit, grade: d.grade })),
					);
					if (data.user?.curriculum?.curriculum_group) {
						this.rootNode = data.user.curriculum.curriculum_group;
					}
					this.assignSubjectsToGroups();
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
				},
			});
	}

	private collectAllGroupIds(group: CurriculumGroup): void {
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
		this.groupCreditTotal = 0;
		this.collectAllGroupIds(this.currentUser.curriculum.curriculum_group);
		this.computeRequiredCredits(this.currentUser.curriculum.curriculum_group);
		const used = new Set<TranscriptDetail>();
		this.processGroup(this.currentUser.curriculum.curriculum_group, used);
		this.groupCreditTotal = Math.max(0, (this.groupCreditRequired.get(this.currentUser?.curriculum?.curriculum_group?.id || -1) || 0) - (this.groupCreditUsed.get(this.currentUser?.curriculum?.curriculum_group?.id || -1) || 0));
		this.calculateProgressPercentage();
		this.notFittedSubjects = this.transcript.details.filter((d) => !used.has(d));
	}

	calculateProgressPercentage(): void {
		this.progressPercentage = 0 ? 0 : ((this.groupCreditUsed.get(this.currentUser?.curriculum?.curriculum_group?.id || -1) || 0) / (this.groupCreditRequired.get(this.currentUser?.curriculum?.curriculum_group?.id || -1) || 0)) * 100;
	}

	private computeRequiredCredits(group: CurriculumGroup): number {
		let required = 0;
		if (group.children?.length) {
			for (const child of group.children) {
				required += this.computeRequiredCredits(child);
			}
		}
		if ((group.type === 'REQUIRED_ALL' || group.credit === 0) && group.subjects?.length) {
			let sum = 0;
			for (const gs of group.subjects) {
				if (gs.subject) {
					sum += gs.subject.credit;
				}
			}
			required += sum;
		} else if (group.type === 'FREE' || group.type === 'COLLECTIVE' || group.type === 'REQUIRED_CREDIT' || group.type === 'REQUIRED_BRANCH') {
			required = group.credit || 0;
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
						if (!this.includeXGrade && detail.grade === 'X') continue;
						if (!used.has(detail) && detail.subject) {
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

			case 'COLLECTIVE':
			case 'REQUIRED_CREDIT': {
				// If the group is inside a REQUIRED_CREDIT parent, we ensure that parent's limit isn't exceeded
				const parentRequiredCreditGroup = this.findParentRequiredCreditGroup(group);
				if (group.subjects?.length) {
					for (const detail of this.transcript!.details) {
						if (!this.includeXGrade && detail.grade === 'X') continue;
						if (totalUsed >= needed) break;

						// Check parent's usage if parent is REQUIRED_CREDIT
						if (parentRequiredCreditGroup && this.groupCreditUsed.get(parentRequiredCreditGroup.id)! >= this.groupCreditRequired.get(parentRequiredCreditGroup.id)!) {
							break;
						}

						if (!used.has(detail) && detail.subject) {
							const match = group.subjects.find((gs) => gs.subject?.id === detail.subject?.id);
							if (match) {
								const c = detail.subject.credit;
								if (totalUsed + c <= needed) {
									this.groupMatches.get(group.id)?.push(detail);
									used.add(detail);
									totalUsed += c;

									// Also update parent's usage if parent is REQUIRED_CREDIT
									if (parentRequiredCreditGroup) {
										const oldVal = this.groupCreditUsed.get(parentRequiredCreditGroup.id) || 0;
										const parentNeeded = this.groupCreditRequired.get(parentRequiredCreditGroup.id) || 0;
										const newVal = Math.min(oldVal + c, parentNeeded);
										this.groupCreditUsed.set(parentRequiredCreditGroup.id, newVal);
									}
								}
							}
						}
					}
				}
				break;
			}

			case 'REQUIRED_BRANCH':
				if (group.subjects?.length) {
					for (const detail of this.transcript!.details) {
						if (!this.includeXGrade && detail.grade === 'X') continue;
						if (totalUsed >= needed) break;
						if (!used.has(detail) && detail.subject) {
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
					if (!this.includeXGrade && detail.grade === 'X') continue;
					if (totalUsed >= needed) break;
					if (!used.has(detail) && detail.subject) {
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
					if (allChildrenComplete) groupIsComplete = true;
					break;
				case 'REQUIRED_CREDIT':
				case 'FREE':
					if (totalUsed >= needed) groupIsComplete = true;
					break;
				case 'REQUIRED_BRANCH':
					if (totalUsed >= needed && this.hasAtLeastOneChildCompleted(group)) {
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
						if (matched.length === group.subjects.length) groupIsComplete = true;
					} else {
						groupIsComplete = true;
					}
					break;
				case 'REQUIRED_CREDIT':
				case 'FREE':
					if (totalUsed >= needed) groupIsComplete = true;
					break;
				case 'REQUIRED_BRANCH':
					groupIsComplete = false;
					break;
				default:
					break;
			}
		}

		this.groupComplete.set(group.id, groupIsComplete);

		return { used: totalUsed, complete: groupIsComplete };
	}

	private hasAtLeastOneChildCompleted(group: CurriculumGroup): boolean {
		if (!group.children || group.children.length === 0) return false;
		for (const child of group.children) {
			if (this.groupComplete.get(child.id)) return true;
		}
		return false;
	}

	/**
	 * Find the nearest ancestor (parent, grandparent, etc.)
	 * that has type 'REQUIRED_CREDIT' for the given group.
	 */
	private findParentRequiredCreditGroup(current: CurriculumGroup): CurriculumGroup | null {
		if (!current.parent_id || current.parent_id <= 0) return null;
		const parent = this.findNodeById(current.parent_id, this.rootNode);
		if (!parent) return null;
		if (parent.type === 'REQUIRED_CREDIT') {
			return parent;
		}
		return this.findParentRequiredCreditGroup(parent);
	}
}
