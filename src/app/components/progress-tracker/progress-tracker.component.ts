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
import { SDMBaseAccordion } from '../accordion/base-accordion.component';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';
import { SDMTotalCreditEarnComponent } from '../total-credit-earn/total-credit-earn.component';

@Component({
	selector: 'sdm-progress-tracker',
	standalone: true,
	imports: [CommonModule, SDMSubjectListCardComponent, SDMBaseButton, SDMTotalCreditEarnComponent, SDMBaseModal, SDMBaseAccordion],
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

	groupMatches = new Map<number, TranscriptDetail[]>(); // วิชาที่ใช้ในแต่ละ group
	groupCreditUsed = new Map<number, number>(); // หน่วยกิตที่ใช้แล้วในแต่ละ group
	groupCreditRequired = new Map<number, number>(); // หน่วยกิตที่ต้องการของแต่ละ group
	groupComplete = new Map<number, boolean>(); // สถานะ complete ของ group

	progressPercentage = 0;
	groupCreditTotal = 0;

	notFittedSubjects: TranscriptDetail[] = []; // วิชาที่ไม่สามารถจับลง group ได้
	subjectData!: Subject;
	currentSubjects: CurriculumGroupSubject[] = [];
	transcriptSubjectIds: string[] = [];
	currentSubjectsGroupColor: string = '';
	accordionLevelExpands: number = 2;
	includeXGrade: boolean = false;
	isFetchingTranscriptDetails: boolean = false;
	nodeType: string = '';

	private gradeOrder = ['S', 'A', 'B', 'C', 'D', 'T', 'X'];

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

	// -------------------------------------------
	// UI / Accordion
	// -------------------------------------------
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

	// -------------------------------------------
	// Data fetching
	// -------------------------------------------
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
						// จัดเรียงวิชา (DESC credit, ASC grade)
						this.transcript.details.sort((a, b) => {
							const creditA = a.subject?.credit || 0;
							const creditB = b.subject?.credit || 0;
							if (creditA !== creditB) return creditB - creditA;
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

	// -------------------------------------------
	// Main logic
	// -------------------------------------------
	assignSubjectsToGroups(): void {
		if (!this.transcript?.details || !this.currentUser?.curriculum?.curriculum_group) {
			this.notFittedSubjects = [];
			return;
		}

		// 1) แยกวิชาเกรด F/U ไป notFitted ทันที
		//    ส่วนวิชา X จะยัดได้ถ้า includeXGrade=true
		const bestBySubject = new Map<string, TranscriptDetail>();
		const duplicateDetails: TranscriptDetail[] = [];
		this.notFittedSubjects = []; // เคลียร์ก่อน

		for (const detail of this.transcript.details) {
			if (!detail.subject?.id) {
				// ไม่มี subject ID => แปลก => ไม่จัดกลุ่ม
				this.notFittedSubjects.push(detail);
				continue;
			}
			const grade = detail.grade?.toUpperCase().trim() || '';
			if (grade === 'F' || grade === 'U') {
				// F/U => ไม่เอาเข้ากลุ่ม => อยู่ notFitted ตลอด
				this.notFittedSubjects.push(detail);
				continue;
			}
			// ที่เหลือ (S,A,B,C,D,T,X) => เข้า bestBySubject
			const subId = detail.subject.id.toString();
			if (!bestBySubject.has(subId)) {
				bestBySubject.set(subId, detail);
			} else {
				// ถ้าเคยมีแล้ว => เลือกตัวดีที่สุด
				const curBest = bestBySubject.get(subId)!;
				const cA = detail.subject?.credit || 0;
				const cB = curBest.subject?.credit || 0;
				if (cA > cB) {
					duplicateDetails.push(curBest);
					bestBySubject.set(subId, detail);
				} else if (cA === cB) {
					const gA = this.gradeOrder.indexOf(grade);
					const gB = this.gradeOrder.indexOf(curBest.grade.toUpperCase().trim());
					if (gA < gB) {
						duplicateDetails.push(curBest);
						bestBySubject.set(subId, detail);
					} else {
						duplicateDetails.push(detail);
					}
				} else {
					duplicateDetails.push(detail);
				}
			}
		}

		// 2) uniqueDetails => วิชาที่คัดแล้ว
		const uniqueDetails = Array.from(bestBySubject.values());
		uniqueDetails.sort((a, b) => {
			const creditA = a.subject?.credit || 0;
			const creditB = b.subject?.credit || 0;
			if (creditA !== creditB) return creditB - creditA;
			const ga = this.gradeOrder.indexOf(a.grade.toUpperCase().trim());
			const gb = this.gradeOrder.indexOf(b.grade.toUpperCase().trim());
			return ga - gb;
		});

		// 3) เตรียม map
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

		// 4) วางวิชา (Greedy) ลงกลุ่ม
		const usedDetails = new Set<TranscriptDetail>();
		for (const detail of uniqueDetails) {
			if (this.placeDetailInGroup(detail, this.currentUser.curriculum.curriculum_group)) {
				usedDetails.add(detail);
			}
		}

		// 5) อัปเดต usage + completeness
		this.updateUsageFromChildren(this.currentUser.curriculum.curriculum_group);
		this.computeCompleteness(this.currentUser.curriculum.curriculum_group);
		const rootId = this.currentUser.curriculum.curriculum_group.id;
		const reqRoot = this.groupCreditRequired.get(rootId) || 0;
		const usedRoot = this.groupCreditUsed.get(rootId) || 0;
		this.groupCreditTotal = Math.max(0, reqRoot - usedRoot);
		this.calculateProgressPercentage();

		// 6) วิชาที่ไม่ได้ใช้ => notFitted
		const notUsedUnique = uniqueDetails.filter((d) => !usedDetails.has(d));
		this.notFittedSubjects.push(...duplicateDetails);
		this.notFittedSubjects.push(...notUsedUnique);

		// 7) แก้ปัญหา RequiredBranch เต็มแล้ว => ดึง usage เกินออก
		this.resolveRequireBranchConflicts(this.rootNode);
		if (this.rootNode) {
			this.updateUsageFromChildren(this.rootNode);
			this.computeCompleteness(this.rootNode);
		}
		this.calculateProgressPercentage();

		// 8) ลูป reassign notFittedSubjects จนกว่าจะนิ่ง
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
				// เรียกอัปเดต usage, completeness, groupCreditTotal, progress
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
	 * (ถ้าวางได้ return true, ถ้าวางไม่ได้ return false)
	 */
	private placeDetailInGroup(detail: TranscriptDetail, group: CurriculumGroup): boolean {
		const grade = detail.grade?.toUpperCase().trim();
		if (grade === 'X' && !this.includeXGrade) return false;

		// ถ้า group เป็น REQUIRED_BRANCH แล้วเต็ม => ไม่รับ
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

		// เช็ก capacity
		const c = detail.subject?.credit ?? 0;
		const need = this.groupCreditRequired.get(group.id) || 0;
		const used = this.groupCreditUsed.get(group.id) || 0;

		// ถ้า subject credit != 0 หรือ group != REQUIRED_ALL => เช็กว่าเต็มหรือยัง
		if (!(c === 0 && group.type === 'REQUIRED_ALL')) {
			if (used >= need) return false;
		}
		// เกิน max => ไม่ใส่
		if (c !== 0 && used + c > this.computeMaxCredits(group)) return false;

		switch (group.type) {
			case 'REQUIRED_ALL':
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					if (!this.groupMatches.get(group.id)?.includes(detail)) {
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + c);
						return true;
					}
				}
				break;

			case 'COLLECTIVE':
			case 'REQUIRED_CREDIT':
			case 'REQUIRED_BRANCH': {
				if (group.subjects?.some((gs) => gs.subject?.id === detail.subject?.id)) {
					const p = this.findParentRequiredCreditGroup(group);
					const pu = p ? this.groupCreditUsed.get(p.id) || 0 : 0;
					const pn = p ? this.groupCreditRequired.get(p.id) || 0 : 0;
					if (c === 0 || (used < need && used + c <= this.computeMaxCredits(group))) {
						if (p && pu >= pn) break; // parent เต็ม
						this.groupMatches.get(group.id)?.push(detail);
						this.groupCreditUsed.set(group.id, used + c);
						if (p) {
							this.groupCreditUsed.set(p.id, Math.min(pu + c, pn));
						}
						return true;
					}
				}
				break;
			}

			case 'FREE':
				if (c === 0 || (used < need && used + c <= this.computeMaxCredits(group))) {
					this.groupMatches.get(group.id)?.push(detail);
					this.groupCreditUsed.set(group.id, used + c);
					return true;
				}
				break;
		}
		return false;
	}

	// -------------------------------------------
	// ใช้ recursive ล้าง usage ทั้ง subtree
	// -------------------------------------------
	private removeAllUsageFromSubtree(group: CurriculumGroup): void {
		// 1) ดึงวิชาใน groupMatches ของ group นี้ โยนกลับไป notFittedSubjects
		const details = this.groupMatches.get(group.id) || [];
		for (const d of details) {
			this.notFittedSubjects.push(d);
		}
		// 2) เคลียร์ matches, usage ของ group นี้
		this.groupMatches.set(group.id, []);
		this.groupCreditUsed.set(group.id, 0);

		// 3) ทำซ้ำกับ children ทุกชั้น
		if (group.children) {
			for (const child of group.children) {
				this.removeAllUsageFromSubtree(child);
			}
		}
	}

	/**
	 * resolveRequireBranchConflicts:
	 * ถ้า group เป็น REQUIRED_BRANCH แล้วใช้เกิน need => ให้ keep แค่บาง children
	 * ที่เหลือให้ removeAllUsageFromSubtree (ลึกลงไปทุกชั้น)
	 */
	private resolveRequireBranchConflicts(group: CurriculumGroup | null): void {
		if (!group) return;

		if (group.type === 'REQUIRED_BRANCH') {
			const need = this.groupCreditRequired.get(group.id) || 0;
			const used = this.groupCreditUsed.get(group.id) || 0;
			if (used >= need && group.children?.length) {
				// sort child ตาม usage มาก -> usage น้อย
				const contrib = group.children.map((c) => ({
					group: c,
					used: this.groupCreditUsed.get(c.id) || 0,
				}));
				contrib.sort((a, b) => b.used - a.used);

				// สะสม usage จากบนลงล่างจนพอ (need)
				let sum = 0;
				const keep: number[] = [];
				for (const x of contrib) {
					if (sum < need) {
						sum += x.used;
						keep.push(x.group.id);
					}
				}

				// ที่ไม่อยู่ใน keep => ลบ usage ทั้ง subtree
				for (const x of contrib) {
					if (!keep.includes(x.group.id) && x.used > 0) {
						this.removeAllUsageFromSubtree(x.group);
					}
				}
			}
		}

		// ทำซ้ำกับ children
		if (group.children?.length) {
			for (const c of group.children) {
				this.resolveRequireBranchConflicts(c);
			}
		}
	}

	// -------------------------------------------
	// usage, completeness
	// -------------------------------------------
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
			if (!group.subjects?.length || group.type === 'FREE') {
				usage = childUsage;
			} else {
				usage = ownUsage + childUsage;
			}
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
				if (group.children?.length) {
					complete = childOK;
				} else {
					if (group.subjects?.length) {
						const matched = this.groupMatches.get(group.id) || [];
						complete = matched.length === group.subjects.length;
					} else complete = true;
				}
				break;
			case 'REQUIRED_CREDIT':
			case 'FREE':
				complete = used >= need;
				break;
			case 'REQUIRED_BRANCH':
				if (group.children?.length) {
					complete = used >= need && this.hasAtLeastOneChildCompleted(group);
				} else complete = false;
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
