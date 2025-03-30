import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '@components/icon/icon.component.js';
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
import { SDMBaseAccordion } from '../accordion/base-accordion.component';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';
import { SDMTotalCreditEarnComponent } from '../total-credit-earn/total-credit-earn.component';

@Component({
	selector: 'sdm-progress-tracker',
	standalone: true,
	imports: [CommonModule, SDMSubjectListCardComponent, SDMBaseButton, SDMTotalCreditEarnComponent, SDMBaseModal, SDMBaseAccordion, IconComponent],
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

	// Map สำหรับเก็บวิชาและหน่วยกิตที่ใช้ในแต่ละกลุ่ม
	groupMatches = new Map<number, TranscriptDetail[]>();
	groupCreditUsed = new Map<number, number>();
	groupCreditRequired = new Map<number, number>();
	groupComplete = new Map<number, boolean>();

	progressPercentage = 0;
	groupCreditTotal = 0; // หน่วยกิตที่ยังขาด (minimum)

	notFittedSubjects: TranscriptDetail[] = [];
	subjectData!: Subject;
	currentSubjects: CurriculumGroupSubject[] = [];
	transcriptSubjectIds: string[] = [];
	currentSubjectsGroupColor: string = '';
	accordionLevelExpands: number = 2;
	includeXGrade: boolean = false;
	isFetchingTranscriptDetails: boolean = false;
	nodeType: string = '';

	// ลำดับเกรด (index ต่ำ = ดี; S ดีสุด)
	private gradeOrder = ['S', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'T', 'X'];

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

	// ------------------ UI / Accordion ------------------
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

	onClickShowSubjectGroup(node: CurriculumGroup): void {
		this.transcriptSubjectIds = this.groupMatches
			.get(node.id)!
			.map((subject) => subject.subject?.id)
			.filter((id): id is string => id !== undefined);
		this.currentSubjectsGroupColor = this.findParentNodeColor(node);
		this.currentSubjects = node.subjects;
		this.nodeType = node.type;
		this.showSubjectGroupModal.show();
	}

	closeShowSubjectGroupModal(): void {
		this.showSubjectGroupModal.hide();
	}

	matchSubjectWithTranscript(subjectId: string): boolean {
		return this.transcriptSubjectIds.includes(subjectId);
	}

	// ------------------ Data fetching ------------------
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
						// เรียงวิชาโดยใช้เกรดก่อน (S, A, B, ... S ดีสุด) ไม่พิจารณาหน่วยกิต
						this.transcript.details.sort((a, b) => {
							const gradeIndexA = this.gradeOrder.indexOf(a.grade.toUpperCase().trim());
							const gradeIndexB = this.gradeOrder.indexOf(b.grade.toUpperCase().trim());
							return gradeIndexA - gradeIndexB;
						});
					}
					if (data.user?.curriculum?.curriculum_group) {
						this.rootNode = data.user.curriculum.curriculum_group;
					}
					this.assignSubjectsToGroups();
				},
				error: (error) => {
					console.error(error);
				},
			});
	}

	// ------------------ Main logic ------------------
	assignSubjectsToGroups(): void {
		if (!this.transcript?.details || !this.currentUser?.curriculum?.curriculum_group) {
			this.notFittedSubjects = [];
			return;
		}

		// 1) แยกวิชาเกรด F/U ไป notFitted ทันที
		const bestBySubject = new Map<string, TranscriptDetail>();
		const duplicateDetails: TranscriptDetail[] = [];
		this.notFittedSubjects = [];

		for (const detail of this.transcript.details) {
			if (!detail.subject?.id) {
				this.notFittedSubjects.push(detail);
				continue;
			}
			const grade = detail.grade?.toUpperCase().trim() || '';
			if (grade === 'F' || grade === 'U') {
				this.notFittedSubjects.push(detail);
				continue;
			}
			const subId = detail.subject.id.toString();
			if (!bestBySubject.has(subId)) {
				bestBySubject.set(subId, detail);
			} else {
				const curBest = bestBySubject.get(subId)!;
				// เปรียบเทียบเฉพาะเกรดเท่านั้น
				const gA = this.gradeOrder.indexOf(grade);
				const gB = this.gradeOrder.indexOf(curBest.grade.toUpperCase().trim());
				if (gA < gB) {
					duplicateDetails.push(curBest);
					bestBySubject.set(subId, detail);
				} else {
					duplicateDetails.push(detail);
				}
			}
		}

		// 2) uniqueDetails
		const uniqueDetails = Array.from(bestBySubject.values());
		uniqueDetails.sort((a, b) => {
			const gradeIndexA = this.gradeOrder.indexOf(a.grade.toUpperCase().trim());
			const gradeIndexB = this.gradeOrder.indexOf(b.grade.toUpperCase().trim());
			return gradeIndexA - gradeIndexB;
		});

		// 3) เตรียม map สำหรับกลุ่ม
		this.groupMatches.clear();
		this.groupCreditUsed.clear();
		this.groupCreditRequired.clear();
		this.groupComplete.clear();
		this.groupCreditTotal = 0;

		this.collectAllGroupIds(this.currentUser.curriculum.curriculum_group);
		this.computeRequiredCredits(this.currentUser.curriculum.curriculum_group);

		for (const id of this.groupCreditRequired.keys()) {
			this.groupMatches.set(id, []);
			this.groupCreditUsed.set(id, 0);
		}

		// 4) วางวิชา (แบบ greedy)
		const usedDetails = new Set<TranscriptDetail>();
		for (const detail of uniqueDetails) {
			if (this.placeDetailInGroup(detail, this.currentUser.curriculum.curriculum_group)) {
				usedDetails.add(detail);
			}
		}

		// 5) อัปเดต usage และ completeness
		this.updateUsageFromChildren(this.currentUser.curriculum.curriculum_group);
		this.computeCompleteness(this.currentUser.curriculum.curriculum_group);
		const rootId = this.currentUser.curriculum.curriculum_group.id;
		const reqRoot = this.groupCreditRequired.get(rootId) || 0;
		const usedRoot = this.groupCreditUsed.get(rootId) || 0;
		this.groupCreditTotal = Math.max(0, reqRoot - usedRoot);
		this.calculateProgressPercentage();

		// 6) วิชาที่ไม่ได้ถูกใช้ => notFittedSubjects
		const notUsedUnique = uniqueDetails.filter((d) => !usedDetails.has(d));
		this.notFittedSubjects.push(...duplicateDetails);
		this.notFittedSubjects.push(...notUsedUnique);

		// 7) แก้ปัญหาในกลุ่ม REQUIRED_BRANCH (ดึงวิชาที่ซ่อนอยู่ลึกออกมา)
		this.resolveRequireBranchConflicts(this.rootNode);
		if (this.rootNode) {
			this.updateUsageFromChildren(this.rootNode);
			this.computeCompleteness(this.rootNode);
		}
		this.calculateProgressPercentage();

		// 8) ลูป reassign วิชาใน notFittedSubjects จนกว่าจะนิ่ง
		let attemptPlaced = true;
		while (attemptPlaced) {
			attemptPlaced = false;
			const remaining = [...this.notFittedSubjects];
			this.notFittedSubjects = [];
			for (const detail of remaining) {
				const g = detail.grade?.toUpperCase().trim() || '';
				if (g === 'F' || g === 'U') {
					this.notFittedSubjects.push(detail);
					continue;
				}
				if (this.placeDetailInGroup(detail, this.rootNode!)) {
					attemptPlaced = true;
				} else {
					this.notFittedSubjects.push(detail);
				}
			}
			if (attemptPlaced) {
				this.updateRootUsageAndProgress();
			}
		}
	}

	private updateRootUsageAndProgress(): void {
		if (!this.rootNode) return;
		this.updateUsageFromChildren(this.rootNode);
		this.computeCompleteness(this.rootNode);
		const rootId = this.rootNode.id;
		const reqRoot = this.groupCreditRequired.get(rootId) || 0;
		const usedRoot = this.groupCreditUsed.get(rootId) || 0;
		this.groupCreditTotal = Math.max(0, reqRoot - usedRoot);
		this.calculateProgressPercentage();
	}

	/**
	 * placeDetailInGroup: พยายามวางวิชา detail ลงใน group
	 * สำหรับ REQUIRED_ALL ต้อง exact match
	 * สำหรับ FREE, REQUIRED_CREDIT, REQUIRED_BRANCH ให้ตีความว่าความต้องการเป็น "ขั้นต่ำ"
	 */
	private placeDetailInGroup(detail: TranscriptDetail, group: CurriculumGroup): boolean {
		const grade = detail.grade?.toUpperCase().trim();
		if (grade === 'X' && !this.includeXGrade) return false;

		// หาก group เป็น REQUIRED_BRANCH และเต็มแล้ว => คืนค่า false
		const req = this.groupCreditRequired.get(group.id) || 0;
		const usedVal = this.groupCreditUsed.get(group.id) || 0;
		if (group.type === 'REQUIRED_BRANCH' && usedVal >= req) {
			return false;
		}

		// ลองลง children ก่อน (recursive)
		if (group.children?.length) {
			for (const child of group.children) {
				if (this.placeDetailInGroup(detail, child)) {
					return true;
				}
			}
		}

		const c = detail.subject?.credit ?? 0;
		const need = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;

		switch (group.type) {
			case 'REQUIRED_ALL': {
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					if (!this.groupMatches.get(group.id)?.includes(detail)) {
						if (used + c > need) return false;
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + c);
						return true;
					}
				}
				break;
			}
			case 'COLLECTIVE':
			case 'REQUIRED_CREDIT':
			case 'REQUIRED_BRANCH': {
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					const p = this.findParentRequiredCreditGroup(group);
					const pu = p ? this.groupCreditUsed.get(p.id) || 0 : 0;
					const pn = p ? this.groupCreditRequired.get(p.id) || 0 : 0;
					if (c === 0 || (used < need && used + c <= this.computeMaxCredits(group))) {
						// หากมี parent และ parent เต็มแล้ว ให้ลอง swap
						if (p && pu >= pn) {
							const currentCourses = this.groupMatches.get(group.id) || [];
							for (let i = 0; i < currentCourses.length; i++) {
								const existing = currentCourses[i];
								const existingGradeIdx = this.gradeOrder.indexOf(existing.grade.toUpperCase().trim());
								const candidateGradeIdx = this.gradeOrder.indexOf(detail.grade.toUpperCase().trim());
								if (candidateGradeIdx < existingGradeIdx) {
									currentCourses.splice(i, 1);
									const updatedUsage = used - (existing.subject?.credit || 0) + c;
									this.groupCreditUsed.set(group.id, updatedUsage > need ? need : updatedUsage);
									this.notFittedSubjects.push(existing);
									this.groupMatches.get(group.id)?.push(detail);
									if (p) {
										const parentUsage = this.groupCreditUsed.get(p.id) || 0;
										this.groupCreditUsed.set(p.id, Math.min(parentUsage + c, pn));
									}
									return true;
								}
							}
							return false;
						}
						// ถ้ายังไม่เต็ม ให้เพิ่มตามปกติ
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + c > need ? need : used + c);
						if (p) {
							const parentUsage = this.groupCreditUsed.get(p.id) || 0;
							this.groupCreditUsed.set(p.id, Math.min(parentUsage + c, pn));
						}
						return true;
					}
				}
				break;
			}
			case 'FREE': {
				// สำหรับกลุ่ม FREE ให้ตีความแบบ "ขั้นต่ำ"
				if (used < need) {
					this.groupMatches.get(group.id)?.push(detail);
					this.groupCreditUsed.set(group.id, used + c > need ? need : used + c);
					return true;
				} else {
					// หาก FREE กลุ่มเต็มแล้ว ให้ลอง swap ภายในกลุ่ม
					const currentCourses = this.groupMatches.get(group.id) || [];
					for (let i = 0; i < currentCourses.length; i++) {
						const existing = currentCourses[i];
						const existingGradeIdx = this.gradeOrder.indexOf(existing.grade.toUpperCase().trim());
						const candidateGradeIdx = this.gradeOrder.indexOf(detail.grade.toUpperCase().trim());
						if (candidateGradeIdx < existingGradeIdx) {
							currentCourses.splice(i, 1);
							const updatedUsage = used - (existing.subject?.credit || 0) + c;
							this.groupCreditUsed.set(group.id, updatedUsage > need ? need : updatedUsage);
							this.notFittedSubjects.push(existing);
							this.groupMatches.get(group.id)?.push(detail);
							return true;
						}
					}
					return false;
				}
			}
		}
		return false;
	}

	// ------------------ Recursive removal for deep conflicts ------------------
	private removeAllUsageFromSubtree(group: CurriculumGroup): void {
		const details = this.groupMatches.get(group.id) || [];
		for (const d of details) {
			this.notFittedSubjects.push(d);
		}
		this.groupMatches.set(group.id, []);
		this.groupCreditUsed.set(group.id, 0);
		if (group.children) {
			for (const child of group.children) {
				this.removeAllUsageFromSubtree(child);
			}
		}
	}

	/**
	 * resolveRequireBranchConflicts:
	 * ถ้า group เป็น REQUIRED_BRANCH และ usage เกิน need ให้คงไว้เฉพาะ children ที่พอ (keep) แล้วล้าง
	 * ของ children ที่เหลือ (ลึกทุกชั้น)
	 */
	private resolveRequireBranchConflicts(group: CurriculumGroup | null): void {
		if (!group) return;

		if (group.type === 'REQUIRED_BRANCH') {
			const need = this.groupCreditRequired.get(group.id) || 0;
			const used = this.groupCreditUsed.get(group.id) || 0;
			if (used >= need && group.children?.length) {
				const contrib = group.children.map((c) => ({
					group: c,
					used: this.groupCreditUsed.get(c.id) || 0,
				}));
				contrib.sort((a, b) => b.used - a.used);

				let sum = 0;
				const keep: number[] = [];
				for (const x of contrib) {
					if (sum < need) {
						sum += x.used;
						keep.push(x.group.id);
					}
				}

				for (const x of contrib) {
					if (!keep.includes(x.group.id) && x.used > 0) {
						this.removeAllUsageFromSubtree(x.group);
					}
				}
			}
		}

		if (group.children?.length) {
			for (const c of group.children) {
				this.resolveRequireBranchConflicts(c);
			}
		}
	}

	// ------------------ Usage & completeness ------------------
	private computeMaxCredits(group: CurriculumGroup): number {
		let max = 0;
		if (group.children?.length) {
			for (const child of group.children) {
				max += this.computeMaxCredits(child);
			}
		}
		let sum = 0;
		if (group.subjects?.length) {
			for (const gs of group.subjects) {
				if (gs.subject) sum += gs.subject.credit;
			}
		}
		if (sum > max) max = sum;
		if (max === 0) max = group.credit || 0;
		return max;
	}

	private updateUsageFromChildren(group: CurriculumGroup): number {
		let ownUsage = this.groupCreditUsed.get(group.id) || 0;
		let childUsage = 0;
		if (group.children?.length) {
			for (const c of group.children) {
				childUsage += this.updateUsageFromChildren(c);
			}
		}
		const need = this.groupCreditRequired.get(group.id) || 0;
		let usage = ownUsage;
		if (group.children && group.children.length > 0) {
			usage = !group.subjects?.length || group.type === 'FREE' ? childUsage : ownUsage + childUsage;
		}
		if (usage > need) usage = need;
		this.groupCreditUsed.set(group.id, usage);
		return usage;
	}

	private computeCompleteness(group: CurriculumGroup): boolean {
		const need = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;
		let childOK = true;
		if (group.children?.length) {
			for (const c of group.children) {
				if (!this.computeCompleteness(c)) childOK = false;
			}
		}
		let complete = false;
		switch (group.type) {
			case 'REQUIRED_ALL':
				complete = group.children?.length ? childOK : group.subjects?.length ? this.groupMatches.get(group.id)?.length === group.subjects.length : true;
				break;
			case 'REQUIRED_CREDIT':
			case 'FREE':
				complete = used >= need;
				break;
			case 'REQUIRED_BRANCH':
				complete = group.children?.length ? used >= need && this.hasAtLeastOneChildCompleted(group) : false;
				break;
			default:
				if (group.children?.length) complete = childOK;
				break;
		}
		this.groupComplete.set(group.id, complete);
		return complete;
	}

	private hasAtLeastOneChildCompleted(group: CurriculumGroup): boolean {
		if (!group.children || group.children.length === 0) return false;
		for (const c of group.children) {
			if (this.groupComplete.get(c.id)) return true;
		}
		return false;
	}

	private findParentRequiredCreditGroup(cur: CurriculumGroup): CurriculumGroup | null {
		if (!cur.parent_id || cur.parent_id <= 0) return null;
		const p = this.findNodeById(cur.parent_id, this.rootNode);
		if (!p) return null;
		if (p.type === 'REQUIRED_CREDIT') return p;
		return this.findParentRequiredCreditGroup(p);
	}

	private collectAllGroupIds(group: CurriculumGroup): void {
		if (group.children?.length) {
			for (const child of group.children) {
				this.collectAllGroupIds(child);
			}
		}
	}

	private computeRequiredCredits(group: CurriculumGroup): number {
		let req = 0;
		if (group.children?.length) {
			for (const child of group.children) {
				req += this.computeRequiredCredits(child);
			}
		}
		if ((group.type === 'REQUIRED_ALL' || group.credit === 0) && group.subjects?.length) {
			let s = 0;
			for (const gs of group.subjects) {
				if (gs.subject) s += gs.subject.credit;
			}
			req += s;
		} else if (group.type === 'FREE' || group.type === 'COLLECTIVE' || group.type === 'REQUIRED_CREDIT' || group.type === 'REQUIRED_BRANCH') {
			req = group.credit || 0;
		} else if (group.credit && !group.children?.length) {
			req += group.credit;
		}
		this.groupCreditRequired.set(group.id, req);
		return req;
	}

	private calculateProgressPercentage(): void {
		const rootId = this.currentUser?.curriculum?.curriculum_group?.id ?? -1;
		const need = this.groupCreditRequired.get(rootId) || 0;
		const used = this.groupCreditUsed.get(rootId) || 0;
		this.progressPercentage = need === 0 ? 0 : (used / need) * 100;
	}
}
