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
	public curriculumIdList: number[] = [];

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
		if (changes['isLoading']) {
			this.isLoadingTranscript = changes['isLoading'].currentValue;
		}
	}

	toggleCheckbox(curriculumId: number, curriculumGroup: CurriculumGroup) {
		console.log('id :', curriculumId);

		this.findChildNodeCheckbox(this.rootNode!, false);

		if (this.lastCheckId === curriculumId) {
			console.log('clear checkbox !!!');
			this.lastCheckId = null;
			return;
		}

		this.lastCheckId = curriculumId;

		this.getChildIdWithSubject(curriculumGroup);
		this.selectedCurriculumId.emit(this.curriculumIdList);

		this.findChildNodeCheckbox(curriculumGroup, true);
	}

	setCheckboxForSubjects(status: boolean) {
		for (const id of this.curriculumIdList) {
			this.curriculumGroupIsChecked[id] = status;
		}
	}

	findChildNodeCheckbox(curriculumGroup: CurriculumGroup, status: boolean) {
		if (!curriculumGroup) return;
		this.curriculumGroupIsChecked[curriculumGroup.id] = status;
		if (curriculumGroup.children) {
			for (const child of curriculumGroup.children) {
				this.findChildNodeCheckbox(child, status);
			}
		}
	}

	getChildIdWithSubject(curriculumGroup: CurriculumGroup) {
		this.curriculumIdList = [];
		this.collectChildIdWithSubject(curriculumGroup);
	}

	private collectChildIdWithSubject(curriculumGroup: CurriculumGroup) {
		if (!curriculumGroup) return;

		if (curriculumGroup.subjects && curriculumGroup.subjects.length !== 0) {
			this.curriculumIdList.push(curriculumGroup.id);
		}

		if (curriculumGroup.children) {
			for (const child of curriculumGroup.children) {
				this.collectChildIdWithSubject(child);
			}
		}
	}

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

	findNodeById(id: number, currentNode: CurriculumGroup | null): CurriculumGroup | null {
		if (!currentNode) return null;
		if (currentNode.id === id) return currentNode;
		for (let child of currentNode.children) {
			const result = this.findNodeById(id, child);
			if (result) return result;
		}
		return null;
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
