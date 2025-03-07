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
			for (let child of group.children) {
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
		for (let child of currentNode.children) {
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
						this.transcript.details.sort((a, b) => this.gradeOrder.indexOf(a.grade) - this.gradeOrder.indexOf(b.grade));
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
		let assignedSubjectIds = new Set<string>();
		this.assignGroupSubjects(this.currentUser.curriculum.curriculum_group, assignedSubjectIds);
		this.updateUsageFromChildren(this.currentUser.curriculum.curriculum_group);
		this.computeCompleteness(this.currentUser.curriculum.curriculum_group);
		const rootId = this.currentUser.curriculum.curriculum_group.id;
		const requiredRoot = this.groupCreditRequired.get(rootId) || 0;
		const usedRoot = this.groupCreditUsed.get(rootId) || 0;
		this.groupCreditTotal = Math.max(0, requiredRoot - usedRoot);
		this.calculateProgressPercentage();
		this.notFittedSubjects = this.transcript.details.filter((d) => {
			const sid = d.subject?.id;
			return !sid || !assignedSubjectIds.has(sid);
		});
	}

	assignGroupSubjects(group: CurriculumGroup, assignedSubjectIds: Set<string>): void {
		let candidates;
		if (group.type === 'FREE') {
			candidates = this.transcript!.details.filter((detail) => {
				const sid = detail.subject?.id;
				if (!sid) return false;
				if (assignedSubjectIds.has(sid)) return false;
				return this.shouldIncludeDetail(detail);
			});
		} else {
			candidates = this.transcript!.details.filter((detail) => {
				const sid = detail.subject?.id;
				if (!sid) return false;
				if (assignedSubjectIds.has(sid)) return false;
				return group.subjects?.some((gs) => gs.subject?.id === sid) && this.shouldIncludeDetail(detail);
			});
		}
		if (group.type === 'COLLECTIVE' || group.type === 'REQUIRED_CREDIT' || group.type === 'REQUIRED_BRANCH' || group.type === 'FREE') {
			candidates.sort((a, b) => (b.subject?.credit || 0) - (a.subject?.credit || 0));
			let required = this.groupCreditRequired.get(group.id) || 0;
			let used = this.groupCreditUsed.get(group.id) || 0;
			for (let detail of candidates) {
				let credit = detail.subject?.credit || 0;
				if (used + credit <= required) {
					this.groupMatches.get(group.id)?.push(detail);
					used += credit;
					assignedSubjectIds.add(detail.subject?.id || '');
				}
			}
			this.groupCreditUsed.set(group.id, used);
		} else if (group.type === 'REQUIRED_ALL') {
			candidates.sort((a, b) => this.gradeOrder.indexOf(a.grade) - this.gradeOrder.indexOf(b.grade));
			let used = this.groupCreditUsed.get(group.id) || 0;
			for (let detail of candidates) {
				this.groupMatches.get(group.id)?.push(detail);
				assignedSubjectIds.add(detail.subject?.id || '');
				used += detail.subject?.credit || 0;
			}
			this.groupCreditUsed.set(group.id, used);
		}
		if (group.children?.length) {
			for (let child of group.children) {
				this.assignGroupSubjects(child, assignedSubjectIds);
			}
		}
	}

	updateUsageFromChildren(group: CurriculumGroup): number {
		let ownUsage = this.groupCreditUsed.get(group.id) || 0;
		let childrenUsage = 0;
		if (group.children?.length) {
			for (let child of group.children) {
				childrenUsage += this.updateUsageFromChildren(child);
			}
		}
		let usage = group.children && group.children.length > 0 ? (group.subjects && group.subjects.length > 0 && group.type !== 'FREE' ? ownUsage + childrenUsage : childrenUsage) : ownUsage;
		this.groupCreditUsed.set(group.id, usage);
		return usage;
	}

	computeCompleteness(group: CurriculumGroup): boolean {
		const needed = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;
		let childrenComplete = true;
		if (group.children?.length) {
			for (let child of group.children) {
				if (!this.computeCompleteness(child)) {
					childrenComplete = false;
				}
			}
		}
		let isComplete = false;
		if (group.type === 'REQUIRED_ALL') {
			isComplete = group.children?.length ? childrenComplete : group.subjects && group.subjects.length ? this.groupMatches.get(group.id)?.length === group.subjects.length : true;
		} else if (group.type === 'REQUIRED_CREDIT' || group.type === 'FREE') {
			isComplete = used >= needed;
		} else if (group.type === 'REQUIRED_BRANCH') {
			isComplete = group.children?.length ? used >= needed && this.hasAtLeastOneChildCompleted(group) : false;
		} else {
			isComplete = group.children?.length ? childrenComplete : false;
		}
		this.groupComplete.set(group.id, isComplete);
		return isComplete;
	}

	hasAtLeastOneChildCompleted(group: CurriculumGroup): boolean {
		if (!group.children || group.children.length === 0) return false;
		for (let child of group.children) {
			if (this.groupComplete.get(child.id)) return true;
		}
		return false;
	}

	findParentRequiredCreditGroup(current: CurriculumGroup): CurriculumGroup | null {
		if (!current.parent_id || current.parent_id <= 0) return null;
		const parent = this.findNodeById(current.parent_id, this.rootNode);
		if (!parent) return null;
		if (parent.type === 'REQUIRED_CREDIT') {
			return parent;
		}
		return this.findParentRequiredCreditGroup(parent);
	}

	collectAllGroupIds(group: CurriculumGroup): void {
		if (group.children?.length) {
			for (let child of group.children) {
				this.collectAllGroupIds(child);
			}
		}
	}

	computeRequiredCredits(group: CurriculumGroup): number {
		let required = 0;
		if (group.children?.length) {
			for (let child of group.children) {
				required += this.computeRequiredCredits(child);
			}
		}
		if ((group.type === 'REQUIRED_ALL' || group.credit === 0) && group.subjects?.length) {
			let sum = 0;
			for (let gs of group.subjects) {
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

	calculateProgressPercentage(): void {
		const rootId = this.currentUser?.curriculum?.curriculum_group?.id ?? -1;
		const required = this.groupCreditRequired.get(rootId) || 0;
		const used = this.groupCreditUsed.get(rootId) || 0;
		this.progressPercentage = required === 0 ? 0 : (used / required) * 100;
	}

	private shouldIncludeDetail(detail: TranscriptDetail): boolean {
		const grade = detail.grade?.toUpperCase().trim() || '';
		if (!this.includeXGrade && grade === 'X') return false;
		if (grade === 'F' || grade === 'U') return false;
		return true;
	}
}
