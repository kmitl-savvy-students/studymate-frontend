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
	isPointFilterOpen = true;
	isSubCateFilterOpen = true;
	isDayFilterOpen = true;
	isTimeFilterOpen = true;

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

	togglePointFilter() {
		this.isPointFilterOpen = !this.isPointFilterOpen;
	}

	toggleCurriculumnGroupFilter() {
		this.isSubCateFilterOpen = !this.isSubCateFilterOpen;
	}

	toggleDayFilter() {
		this.isDayFilterOpen = !this.isDayFilterOpen;
	}

	subjects = [
		{
			category: 'หมวดวิชาศึกษาทั่วไป',
			completed: 30,
			remaining: 0,
			subCategories: [
				{
					name: 'วิชาพื้นฐาน',
					completed: 6,
					remaining: 0,
					courses: [
						{ code: '90641001', title: 'CHARM SCHOOL' },
						{
							code: '90641002',
							title: 'DIGITAL INTELLIGENCE QUOTIENT',
						},
						{
							code: '90641003',
							title: 'SPORTS AND RECREATIONAL ACTIVITIES',
						},
					],
				},
				{
					name: 'วิชาด้านภาษาและการสื่อสาร',
					completed: 9,
					remaining: 0,
					courses: [
						{ code: '90644007', title: 'FOUNDATION ENGLISH 1' },
						{
							code: '90644008',
							title: 'FOUNDATION ENGLISH 2',
						},
						{
							code: '90644018',
							title: 'ENGLISH FOR MARKETING',
						},
					],
				},
				{
					name: 'วิชาตามเกณฑ์ของคณะ',
					completed: 3,
					remaining: 0,
					courses: [
						{
							code: '90642118',
							title: 'APPLICATION SOFTWARE FOR BUSSINESS',
						},
						{
							code: '90642036',
							title: 'PRE-ACTIVITIES FOR ENGINEERS',
						},
					],
				},
				{
					name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
					completed: 12,
					remaining: 0,
					courses: [
						{
							code: '90591016',
							title: 'HAPPINESS SKILLS',
						},
						{
							code: '90643035',
							title: 'KNOWLEDGE MANAGEMENT FOR INNOVATION',
						},
						{
							code: '90642110',
							title: 'FUN WITH DATA SCIENCE',
						},
						{
							code: '90642111',
							title: 'FUN WITH CODING',
						},
					],
				},
			],
		},
		{
			category: 'หมวดวิชาเฉพาะ',
			completed: 88,
			remaining: 12,
			subCategories: [
				{
					name: 'วิชาแกน',
					completed: 30,
					remaining: 0,
					subCourses: [
						{
							name: 'วิชาแกนทางคณิตศาสตร์',
							courses: [
								{ code: '01076140', title: 'CALCULUS 1' },
								{ code: '01076141', title: 'CALCULUS 2' },
								{
									code: '01076032',
									title: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
								},
								{
									code: '01076253',
									title: 'PROBABILITY AND STATISTICS',
								},
							],
						},
						{
							name: 'วิชาแกนทางวิศวกรรม',
							courses: [
								{
									code: '01076101',
									title: 'INTRODUCTION TO COMPUTER ENGINEERING',
								},
								{
									code: '01076103',
									title: 'PROGRAMMING FUNDAMENTAL',
								},
								{
									code: '01076104',
									title: 'PROGRAMMING PROJECT',
								},
								{
									code: '01076107',
									title: 'CIRCUITS AND ELECTRONICS',
								},
								{
									code: '01076108',
									title: 'CIRCUITS AND ELECTRONICS IN PRACTICE',
								},
								{
									code: '01076012',
									title: 'DISCRETE STRUCTURE',
								},
								{
									code: '01076011',
									title: 'OPERATING SYSTEMS',
								},
								{
									code: '01076016',
									title: 'COMPUTER ENGINEERING PROJECT PREPARATION',
								},
								{
									code: '01006004',
									title: 'INDUSTRIAL TRAINING',
								},
							],
						},
					],
				},
				{
					name: 'วิชาเฉพาะด้าน',
					completed: 46,
					remaining: 6,
					subCourses: [
						{
							name: 'วิชาบังคับ',
							groups: [
								{
									groupName: 'กลุ่มเทคโนโลยีเพื่องานประยุกต์',
									courses: [
										{
											code: '01076263',
											title: 'DATABASE SYSTEMS',
										},
									],
								},
								{
									groupName: 'กลุ่มเทคโนโลยีและวิธีการทางซอฟต์แวร์',
									courses: [
										{
											code: '01076105',
											title: 'OBJECT ORIENTED PROGRAMMING',
										},
										{
											code: '01076106',
											title: 'OBJECT ORIENTED PROGRAMMING PROJECT',
										},
										{
											code: '01076109',
											title: 'OBJECT ORIENTED DATA STRUCTURES',
										},
										{
											code: '01076110',
											title: 'OBJECT ORIENTED DATA STRUCTURES PROJECT',
										},
										{
											code: '01076119',
											title: 'WEB APPLICATION DEVELOPMENT',
										},
										{
											code: '01076120',
											title: 'WEB APPLICATION DEVELOPMENT PROJECT',
										},
										{
											code: '01076034',
											title: 'PRINCIPLES OF SOFTWARE DEVELOPMENT PROCESS',
										},
									],
								},
								{
									groupName: 'กลุ่มโครงสร้างพื้นฐานของระบบ',
									courses: [
										{
											code: '01076121',
											title: 'THEORY OF COMPUTATION',
										},
										{
											code: '01076116',
											title: 'COMPUTER NETWORKS',
										},
										{
											code: '01076117',
											title: 'COMPUTER NETWORKS IN PRACTICE',
										},
										{
											code: '01076118',
											title: 'SYSTEM PLATFORM ADMINISTRATION',
										},
										{
											code: '01076040',
											title: 'INTERNETWORKING STANDARDS AND TECHNOLOGIES',
										},
										{
											code: '01076041',
											title: 'INTERNETWORKING STANDARDS AND TECHNOLOGIES IN PRACTICE',
										},
									],
								},
								{
									groupName: 'กลุ่มฮาร์ดแวร์และสถาปัตยกรรมคอมพิวเตอร์',
									courses: [
										{
											code: '01076112',
											title: 'DIGITAL SYSTEM FUNDAMENTALS',
										},
										{
											code: '01076113',
											title: 'DIGITAL SYSTEM FUNDAMENTALS IN PRACTICE',
										},
										{
											code: '01076114',
											title: 'COMPUTER ORGANIZATION AND ARCHITECTURE',
										},
										{
											code: '01076115',
											title: 'COMPUTER ORGANIZATION IN PRACTICE',
										},
										{
											code: '01076050',
											title: 'MICROCONTROLLER APPLICATION AND DEVELOPMENT',
										},
										{
											code: '01076051',
											title: 'MICROCONTROLLER PROJECT',
										},
									],
								},
							],
						},
						{
							name: 'วิชาบังคับเลือก (ไม่น้อยกว่า 9 หน่วยกิต)',
							courses: [
								{
									code: '01076036',
									title: 'USER EXPERIENCE AND USER INTERFACE DESIGN',
								},
								{
									code: '01076037',
									title: 'USER EXPERIENCE AND USER INTERFACE PROJECT',
								},
							],
						},
					],
				},
				{
					name: 'วิชาการศึกษาทางเลือก',
					completed: 0,
					remaining: 6,
				},
				{
					name: 'วิชาเลือกเฉพาะสาขา',
					completed: 12,
					remaining: 0,
					courses: [
						{
							code: '01076423',
							title: 'STRATEGIC PLANNING USING BOARD AND CARD GAME',
						},
						{
							code: '01076423',
							title: 'IMAGE PROCESSING',
						},
						{
							code: '01076582',
							title: 'ARTIFICIAL INTELLIGENCE',
						},
						{
							code: '01076568',
							title: 'HUMAN COMPUTER INTERACTION',
						},
					],
				},
			],
		},
		{
			category: 'หมวดวิชาเสรี',
			completed: 3,
			remaining: 3,
			subCategories: [],
		},
	];
}
