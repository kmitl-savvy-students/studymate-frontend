import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Transcript } from '@models/Transcript.model.js';
import { User } from '@models/User.model.js';
import { APIManagementService } from '@services/api-management.service.js';
import { AuthenticationService } from '@services/authentication/authentication.service.js';
import { LoadingService } from '@services/loading/loading.service.js';
import { SDMBaseAccordion } from '../accordion/base-accordion.component';
import { IconComponent } from '../icon/icon.component';
import { SDMLoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { CurriculumGroup } from './../../shared/models/CurriculumGroup.model';

@Component({
	selector: 'sdm-filter-bar',
	standalone: true,
	imports: [IconComponent, CommonModule, SDMLoadingSkeletonComponent, SDMBaseAccordion],
	templateUrl: './filter-bar.component.html',
	styleUrl: './filter-bar.component.css',
})
export class SDMfilterBarComponent implements OnInit {
	@Input() isReviewPage: boolean = false;

	public currentUser: User | null = null;
	public transcript: Transcript | null = null;
	public isLoadingTranscript: boolean = false;
	public curriculumGroup: Array<CurriculumGroup> | undefined = [];
	public openAccordions: Set<number> = new Set<number>();
	public accordionLevelExpands: number = 2;
	public rootNode: CurriculumGroup | null = null;

	constructor(
		private apiManagementService: APIManagementService,
		private loadingService: LoadingService,
		private authService: AuthenticationService,
	) {}

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

	fetchTranscripts() {
		if (!this.currentUser) return;
		this.isLoadingTranscript = true;
		this.apiManagementService.FetchTranscript(this.currentUser.id).subscribe({
			next: (data) => {
				this.transcript = data;
				this.rootNode = data.user!.curriculum.curriculum_group;
				this.curriculumGroup = data.user!.curriculum.curriculum_group?.children;
				this.isLoadingTranscript = false;
				console.log('filter data:', this.transcript);
				console.log('curriculum data:', this.curriculumGroup);
			},
			error: (error) => {
				console.error('Error fetching transcript:', error);
			},
		});
	}
}
