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
	groupCreditTotal = 0;
	groupComplete = new Map<number, boolean>();
	progressPercentage = 0;
	notFittedSubjects: TranscriptDetail[] = [];
	subjectData!: Subject;
	currentSubjects: CurriculumGroupSubject[] = [];
	currentSubjectsGroupColor = '';
	accordionLevelExpands = 2;
	includeXGrade = false;
	isFetchingTranscriptDetails = false;
	private gradeOrder = ['S', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'T', 'X', 'F', 'U'];

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

	toggleIncludeXGrade(): void {
		this.includeXGrade = !this.includeXGrade;
		this.assignSubjectsToGroups();
	}

	getSubjectDetailUrl(subjectData: string): string {
		return this.router.serializeUrl(this.router.createUrlTree(['/subject/subject-detail', subjectData]));
	}

	expandAccordions(group: CurriculumGroup, levelLeft: number): void {
		if (levelLeft === 0) return;
		if (group.children?.length) {
			for (const child of group.children) {
				this.openAccordions.add(child.id);
				this.expandAccordions(child, levelLeft - 1);
			}
		}
	}

	collapseAllAccordions(): void {
		this.openAccordions.clear();
	}

	toggleAccordion(groupId: number): void {
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
		const fallback = '#e7e5e4';
		if (currentNode.color?.toUpperCase() !== '#FFFFFF' && currentNode.color?.trim().length !== 0) {
			return currentNode.color;
		}
		const parentNode = this.findNodeById(currentNode.parent_id, this.rootNode);
		if (!parentNode) return fallback;
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

	onClickShowSubjectGroup(subjects: CurriculumGroupSubject[], color: string): void {
		this.currentSubjectsGroupColor = color;
		this.currentSubjects = subjects;
		this.showSubjectGroupModal.show();
	}

	fetchTranscripts(): void {
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
					if (this.transcript?.details) {
						this.transcript.details.sort((a, b) => {
							const gradeIndexA = this.gradeOrder.indexOf(a.grade);
							const gradeIndexB = this.gradeOrder.indexOf(b.grade);
							if (gradeIndexA !== gradeIndexB) {
								return gradeIndexA - gradeIndexB;
							}
							const creditA = a.subject?.credit || 0;
							const creditB = b.subject?.credit || 0;
							return creditB - creditA;
						});
					}
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

	assignSubjectsToGroups(): void {
		if (!this.transcript?.details || !this.currentUser?.curriculum?.curriculum_group) {
			this.notFittedSubjects = [];
			return;
		}
		const bestBySubject = new Map<string, TranscriptDetail>();
		const duplicateDetails: TranscriptDetail[] = [];
		for (const detail of this.transcript.details) {
			if (!detail.subject?.id) continue;
			const subId = detail.subject.id;
			if (!bestBySubject.has(subId)) {
				bestBySubject.set(subId, detail);
			} else {
				const currentBest = bestBySubject.get(subId)!;
				if (this.gradeOrder.indexOf(detail.grade) < this.gradeOrder.indexOf(currentBest.grade)) {
					duplicateDetails.push(currentBest);
					bestBySubject.set(subId, detail);
				} else {
					duplicateDetails.push(detail);
				}
			}
		}
		const uniqueDetails = Array.from(bestBySubject.values());
		this.groupMatches.clear();
		this.groupCreditUsed.clear();
		this.groupCreditRequired.clear();
		this.groupComplete.clear();
		this.groupCreditTotal = 0;
		this.collectAllGroupIds(this.currentUser.curriculum.curriculum_group);
		this.computeRequiredCredits(this.currentUser.curriculum.curriculum_group);
		Array.from(this.groupCreditRequired.keys()).forEach((id) => {
			this.groupMatches.set(id, []);
			this.groupCreditUsed.set(id, 0);
		});
		const usedDetails = new Set<TranscriptDetail>();
		for (const detail of uniqueDetails) {
			if (this.placeDetailInGroup(detail, this.currentUser.curriculum.curriculum_group)) {
				usedDetails.add(detail);
			}
		}
		this.updateUsageFromChildren(this.currentUser.curriculum.curriculum_group);
		this.computeCompleteness(this.currentUser.curriculum.curriculum_group);
		const rootId = this.currentUser.curriculum.curriculum_group.id;
		const requiredRoot = this.groupCreditRequired.get(rootId) || 0;
		const usedRoot = this.groupCreditUsed.get(rootId) || 0;
		this.groupCreditTotal = Math.max(0, requiredRoot - usedRoot);
		this.calculateProgressPercentage();
		const notUsedUnique = uniqueDetails.filter((d) => !usedDetails.has(d));
		this.notFittedSubjects = duplicateDetails.concat(notUsedUnique);
	}

	private placeDetailInGroup(detail: TranscriptDetail, group: CurriculumGroup): boolean {
		if (detail.grade?.toUpperCase().trim() === 'X' && !this.includeXGrade) return false;
		if (group.children?.length) {
			for (const child of group.children) {
				if (this.placeDetailInGroup(detail, child)) {
					return true;
				}
			}
		}
		const needed = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;
		switch (group.type) {
			case 'REQUIRED_ALL':
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					if (!this.groupMatches.get(group.id)?.includes(detail)) {
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + (detail.subject?.credit ?? 0));
						return true;
					}
				}
				break;
			case 'COLLECTIVE':
			case 'REQUIRED_CREDIT':
			case 'REQUIRED_BRANCH':
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					const parent = this.findParentRequiredCreditGroup(group);
					const parentNeeded = parent ? this.groupCreditRequired.get(parent.id) || 0 : 0;
					const parentUsed = parent ? this.groupCreditUsed.get(parent.id) || 0 : 0;
					if (used < needed) {
						if (used + (detail.subject?.credit ?? 0) <= needed) {
							if (parent && parentUsed >= parentNeeded) {
								break;
							}
							this.groupMatches.get(group.id)?.push(detail);
							this.groupCreditUsed.set(group.id, used + (detail.subject?.credit ?? 0));
							if (parent) {
								this.groupCreditUsed.set(parent.id, Math.min(parentUsed + (detail.subject?.credit ?? 0), parentNeeded));
							}
							return true;
						}
					}
				}
				break;
			case 'FREE':
				if (used < needed) {
					if (used + (detail.subject?.credit ?? 0) <= needed) {
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + (detail.subject?.credit ?? 0));
						return true;
					}
				}
				break;
		}
		return false;
	}

	private updateUsageFromChildren(group: CurriculumGroup): number {
		let ownUsage = this.groupCreditUsed.get(group.id) || 0;
		let childrenUsage = 0;
		if (group.children?.length) {
			for (const child of group.children) {
				childrenUsage += this.updateUsageFromChildren(child);
			}
		}
		const needed = this.groupCreditRequired.get(group.id) || 0;
		let usage = ownUsage;
		if (group.children && group.children.length > 0) {
			if (!group.subjects || group.subjects.length === 0 || group.type === 'FREE') {
				usage = childrenUsage;
			} else {
				usage = ownUsage + childrenUsage;
			}
		}
		if (usage > needed) usage = needed;
		this.groupCreditUsed.set(group.id, usage);
		return usage;
	}

	private computeCompleteness(group: CurriculumGroup): boolean {
		const needed = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;
		let childrenComplete = true;
		if (group.children?.length) {
			for (const child of group.children) {
				if (!this.computeCompleteness(child)) {
					childrenComplete = false;
				}
			}
		}
		let isComplete = false;
		switch (group.type) {
			case 'REQUIRED_ALL':
				if (group.children?.length) {
					isComplete = childrenComplete;
				} else {
					if (group.subjects?.length) {
						const matched = this.groupMatches.get(group.id) || [];
						isComplete = matched.length === group.subjects.length;
					} else {
						isComplete = true;
					}
				}
				break;
			case 'REQUIRED_CREDIT':
			case 'FREE':
				isComplete = used >= needed;
				break;
			case 'REQUIRED_BRANCH':
				if (group.children?.length) {
					isComplete = used >= needed && this.hasAtLeastOneChildCompleted(group);
				} else {
					isComplete = false;
				}
				break;
			default:
				if (group.children?.length) {
					isComplete = childrenComplete;
				}
				break;
		}
		this.groupComplete.set(group.id, isComplete);
		return isComplete;
	}

	private hasAtLeastOneChildCompleted(group: CurriculumGroup): boolean {
		if (!group.children || group.children.length === 0) return false;
		for (const child of group.children) {
			if (this.groupComplete.get(child.id)) return true;
		}
		return false;
	}

	private findParentRequiredCreditGroup(current: CurriculumGroup): CurriculumGroup | null {
		if (!current.parent_id || current.parent_id <= 0) return null;
		const parent = this.findNodeById(current.parent_id, this.rootNode);
		if (!parent) return null;
		if (parent.type === 'REQUIRED_CREDIT') {
			return parent;
		}
		return this.findParentRequiredCreditGroup(parent);
	}

	private collectAllGroupIds(group: CurriculumGroup): void {
		if (group.children?.length) {
			for (const child of group.children) {
				this.collectAllGroupIds(child);
			}
		}
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

	private calculateProgressPercentage(): void {
		const rootId = this.currentUser?.curriculum?.curriculum_group?.id ?? -1;
		const required = this.groupCreditRequired.get(rootId) || 0;
		const used = this.groupCreditUsed.get(rootId) || 0;
		if (required === 0) {
			this.progressPercentage = 0;
		} else {
			this.progressPercentage = (used / required) * 100;
		}
	}

	private shouldIncludeDetail(detail: TranscriptDetail): boolean {
		const grade = detail.grade?.toUpperCase().trim() || '';
		if (grade === 'F' || grade === 'U') return false;
		return true;
	}
}
