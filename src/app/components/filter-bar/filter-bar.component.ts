import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Transcript } from '@models/Transcript.model.js';
import { User } from '@models/User.model.js';
import { SDMBaseAccordion } from '../accordion/base-accordion.component';
import { IconComponent } from '../icon/icon.component';
import { SDMLoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { SDMRatingComponent } from '../rating/rating.component';
import { Curriculum } from './../../shared/models/Curriculum.model';
import { CurriculumGroup } from './../../shared/models/CurriculumGroup.model';

@Component({
	selector: 'sdm-filter-bar',
	standalone: true,
	imports: [IconComponent, CommonModule, SDMLoadingSkeletonComponent, SDMBaseAccordion, SDMRatingComponent],
	templateUrl: './filter-bar.component.html',
	styleUrl: './filter-bar.component.css',
})
export class SDMfilterBarComponent implements OnInit {
	@Input() isReviewPage: boolean = false;
	@Input() selectedCurriculum: Curriculum | undefined;
	@Input() isLoading: boolean = false;

	@Input() initialSelectedDays: string[] = [];
	@Input() initialSelectedRating: number | null = null;
	@Input() initialSelectedCurriculumIdList: number[] = [];

	@Output() selectedDays = new EventEmitter<string[]>();
	@Output() selectedRating = new EventEmitter<number>();
	@Output() selectedCurriculumId = new EventEmitter<number[]>();

	public isLoadingTranscript: boolean = false;
	public currentUser: User | null = null;
	public transcript: Transcript | null = null;
	public curriculum: Curriculum | undefined;
	public curriculumGroup: Array<CurriculumGroup> | undefined = [];
	public openAccordions: Set<number> = new Set<number>();
	public accordionLevelExpands: number = 2;
	public rootNode: CurriculumGroup | undefined = undefined;
	public ratingOption: number[] = Array.from({ length: 6 }, (_, i) => i).reverse();
	public dayOption: string[] = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
	public selectedDaysInput: string[] = [];
	public selectedRatingInput: number | null = null;

	public curriculumGroupIsChecked: Record<number, boolean> = {};
	public lastCheckId: number | null = null;
	private selectedIds: number[] = [];

	constructor() {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedCurriculum']) {
			this.curriculum = changes['selectedCurriculum'].currentValue;
			this.rootNode = this.curriculum?.curriculum_group ?? undefined;
			this.curriculumGroup = this.curriculum?.curriculum_group?.children;
			if (this.curriculum?.curriculum_group) {
				this.openAccordions.add(this.curriculum?.curriculum_group.id);
				this.expandAccordions(this.curriculum?.curriculum_group, this.accordionLevelExpands - 1);
			}
		}
		if (changes['initialSelectedDays']) {
			this.selectedDaysInput = [...this.initialSelectedDays];
		}
		if (changes['initialSelectedRating']) {
			this.selectedRatingInput = this.initialSelectedRating;
		}
	}

	toggleCheckbox(curriculumId: number, curriculumGroup: CurriculumGroup) {
		console.log('id :', curriculumId);

		// ถ้า node นี้ถูกเลือกอยู่แล้ว ให้ยกเลิกการเลือกทั้ง node และลูกๆ
		if (this.isChecked(curriculumId)) {
			console.log('Unchecking node:', curriculumId);

			// ลบ curriculumId ออกจาก selectedIds
			this.selectedIds = this.selectedIds.filter((id) => id !== curriculumId);

			// ยกเลิกการเลือก node นี้และลูกๆ
			this.findChildNodeCheckbox(curriculumGroup, false);

			//เช็คว่าถ้า parent node ยังมีลูกที่ถูกเลือกอยู่หรือไม่

			this.uncheckParentIfNoChildrenSelected(curriculumGroup);

			// Emit ค่าใหม่
			this.selectedCurriculumId.emit(this.selectedIds);
			console.log('SelectedIds:', this.selectedIds);
			return;
		}

		console.log('curGroup:', curriculumGroup);
		// ถ้ายังไม่เลือก ให้เพิ่ม curriculumId และลูกๆ ของมัน
		this.getChildIdWithSubject(curriculumGroup);

		// เพิ่ม curriculumId ที่เลือก
		this.selectedIds = [...this.selectedIds];

		// ✅ เช็คว่า Parent ต้องถูกเลือกด้วยไหม
		this.checkParentIfChildrenSelected(curriculumGroup);

		// Emit ค่าใหม่
		this.selectedCurriculumId.emit(this.selectedIds);

		// อัปเดตสถานะ checkbox ให้ตรงกับค่าที่เลือก
		this.findChildNodeCheckbox(curriculumGroup, true);

		console.log('SelectedIds:', this.selectedIds);
	}

	// ฟังก์ชันตรวจสอบว่า parentGroup ยังมีลูกที่ถูกเลือกอยู่หรือไม่
	private uncheckParentIfNoChildrenSelected(curriculumGroup: CurriculumGroup) {
		console.log('call uncheckParentIfNoChildrenSelected for node:', curriculumGroup);

		// ตรวจสอบค่า parent_id
		if (!curriculumGroup || curriculumGroup.parent_id == null) {
			console.log('❌ curriculumGroup or parent_id is null:', curriculumGroup);
			return;
		}

		// หา parent node
		const parentNode = this.findNodeById(curriculumGroup.parent_id, this.rootNode!);
		console.log('🔍 Found parentNode:', parentNode);

		if (!parentNode) {
			console.log('❌ Parent node not found!');
			return;
		}

		// ตรวจสอบว่ามีลูกที่ถูกเลือกอยู่หรือไม่
		const hasCheckedChild = parentNode.children.some((child) => this.isChecked(child.id));
		console.log(`🔍 Parent (${parentNode.id}) hasCheckedChild:`, hasCheckedChild);

		if (!hasCheckedChild) {
			console.log(`🔄 Unchecking parent node: ${parentNode.id}`);
			this.curriculumGroupIsChecked[parentNode.id] = false;
			this.selectedIds = this.selectedIds.filter((id) => id !== parentNode.id);

			// ✅ ไล่เช็ค parent ที่สูงขึ้นไปด้วย
			this.uncheckParentIfNoChildrenSelected(parentNode);
		}
	}

	// ฟังก์ชันทำให้ Parent ถูกเลือกถ้ามีลูกถูกเลือก
	private checkParentIfChildrenSelected(curriculumGroup: CurriculumGroup) {
		console.log('call checkParentIfChildrenSelected for node:', curriculumGroup);

		if (!curriculumGroup || curriculumGroup.parent_id == null) {
			console.log('❌ curriculumGroup or parent_id is null:', curriculumGroup);
			return;
		}

		// หา parent node
		const parentNode = this.findNodeById(curriculumGroup.parent_id, this.rootNode!);
		console.log('🔍 Found parentNode:', parentNode);

		if (!parentNode) {
			console.log('❌ Parent node not found!');
			return;
		}

		// ถ้ามีลูกที่ถูกเลือกอยู่ Parent ต้องถูกเลือกด้วย
		const hasCheckedChild = parentNode.children.some((child) => this.isChecked(child.id));
		console.log(`🔍 Parent (${parentNode.id}) hasCheckedChild:`, hasCheckedChild);

		if (hasCheckedChild) {
			console.log(`✅ Checking parent node: ${parentNode.id}`);
			this.curriculumGroupIsChecked[parentNode.id] = true;
			if (!this.selectedIds.includes(parentNode.id)) {
				this.selectedIds.push(parentNode.id);
			}

			// ✅ ไล่เช็ค parent ที่สูงขึ้นไปด้วย
			this.checkParentIfChildrenSelected(parentNode);
		}
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

	// ฟังก์ชันที่ใช้ในการตั้งค่าสถานะ checkbox สำหรับลูกทั้งหมดของ curriculumGroup
	findChildNodeCheckbox(curriculumGroup: CurriculumGroup, status: boolean) {
		if (!curriculumGroup) return;

		// ถ้าต้องการยกเลิกการเลือก (status = false)
		if (!status) {
			this.selectedIds = this.selectedIds.filter((id) => id !== curriculumGroup.id);
		} else {
			if (!this.selectedIds.includes(curriculumGroup.id)) {
				this.selectedIds.push(curriculumGroup.id);
			}
		}

		// อัปเดตสถานะ checkbox ของ curriculumGroup นี้
		this.curriculumGroupIsChecked[curriculumGroup.id] = status;

		// ✅ เรียกใช้เช็ค parent ทุกครั้งที่เลือก node
		if (status) {
			this.checkParentIfChildrenSelected(curriculumGroup);
		}

		// ถ้ามีลูก, ให้ทำการเรียกฟังก์ชันนี้ซ้ำไปยังลูกๆ
		if (curriculumGroup.children) {
			for (const child of curriculumGroup.children) {
				this.findChildNodeCheckbox(child, status);
			}
		}
	}

	// ฟังก์ชันนี้ใช้ดึงข้อมูล child ที่มี subjects และเก็บ curriculumId ลงใน selectedIds
	getChildIdWithSubject(curriculumGroup: CurriculumGroup) {
		const newSelectedIds: number[] = [];
		this.collectChildIdWithSubject(curriculumGroup, newSelectedIds);

		// รวม ID ใหม่เข้ากับ selectedIds เดิม (ป้องกันการล้างค่าก่อนหน้า)
		this.selectedIds = [...this.selectedIds, ...newSelectedIds];
	}

	// ฟังก์ชันที่เก็บ curriculumId ทั้งหมดของ child ที่มี subjects
	private collectChildIdWithSubject(curriculumGroup: CurriculumGroup, selectedIds: number[]) {
		if (!curriculumGroup) return;

		// ถ้ามี subjects ให้เก็บ curriculumId นี้ลงใน selectedIds
		if (curriculumGroup.subjects && curriculumGroup.subjects.length !== 0) {
			selectedIds.push(curriculumGroup.id);
		}

		// ทำแบบเดียวกันสำหรับลูกของ curriculumGroup
		if (curriculumGroup.children) {
			for (const child of curriculumGroup.children) {
				this.collectChildIdWithSubject(child, selectedIds);
			}
		}
	}

	// ฟังก์ชันตรวจสอบว่า curriculumId ถูกเลือกหรือไม่
	isChecked(curriculumId: number): boolean {
		return this.curriculumGroupIsChecked[curriculumId] || false;
	}

	onClickReviewFilter(rating: number) {
		this.selectedRatingInput = this.selectedRatingInput === rating ? null : rating;
		this.selectedRating.emit(this.selectedRatingInput!);
	}

	toggleDay(day: string) {
		const dayOrder = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
		if (this.selectedDaysInput.includes(day)) {
			this.selectedDaysInput = this.selectedDaysInput.filter((d) => d !== day);
		} else {
			this.selectedDaysInput.push(day);
		}
		this.selectedDaysInput.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
		this.selectedDays.emit(this.selectedDaysInput);
	}

	findParentNodeColor(currentNode: CurriculumGroup): string {
		const GRAY = '#e7e5e4';
		if (currentNode.color?.toUpperCase() !== '#FFFFFF' && currentNode.color?.trim().length !== 0) {
			return currentNode.color;
		}
		const parentNode = this.findNodeById(currentNode.parent_id, this.rootNode!);
		if (!parentNode) return GRAY;
		return this.findParentNodeColor(parentNode);
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
}
