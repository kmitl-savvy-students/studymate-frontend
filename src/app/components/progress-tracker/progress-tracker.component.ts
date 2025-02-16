import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CurriculumGroup } from '@models/CurriculumGroup.model';
import { Transcript } from '@models/Transcript.model';
import { TranscriptDetail } from '@models/TranscriptDetail.model';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMButtonLink } from '../buttons/button-link.component';
import { SDMSubjectListCardComponent } from '../subject-list-card/subject-list-card.component';

@Component({
	selector: 'sdm-progress-tracker',
	standalone: true,
	imports: [CommonModule, SDMSubjectListCardComponent, SDMButtonLink, SDMBaseButton],
	templateUrl: './progress-tracker.component.html',
})
export class SDMProgressTracker implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
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

	// findParentNode(currentNode: CurriculumGroup, rootNode: CurriculumGroup): CurriculumGroup | null {
	// 	// ถ้าโหนดรากมีโหนดลูก
	// 	if (rootNode.children && rootNode.children.length > 0) {
	// 		for (const child of rootNode.children) {
	// 			// ถ้าเจอโหนดลูกที่ตรงกับโหนดปัจจุบัน
	// 			if (child.id === currentNode.id) {
	// 				return rootNode; // คืนค่าโหนดพาเรนต์
	// 			}
	// 			// ค้นหาในโหนดลูกถัดไป
	// 			const parent = this.findParentNode(currentNode, child);
	// 			if (parent) {
	// 				return parent;
	// 			}
	// 		}
	// 	}
	// 	return null; // ถ้าไม่พบโหนดพาเรนต์
	// }

	// findParentNodeColor(currentNode: CurriculumGroup, rootNode: CurriculumGroup): string {
	// 	// ถ้าโหนดปัจจุบันมีค่าสีที่ไม่ใช่ค่าว่างหรือ #FFFFFF
	// 	if (currentNode.color && currentNode.color !== '#FFFFFF') {
	// 		return currentNode.color;
	// 	}
	// 	// ค้นหาโหนดพาเรนต์
	// 	const parentNode = this.findParentNode(currentNode, rootNode);
	// 	if (parentNode) {
	// 		// เรียกฟังก์ชันซ้ำกับโหนดพาเรนต์
	// 		return this.findParentNodeColor(parentNode, rootNode);
	// 	}
	// 	return '#FFFFFF'; // หรือค่าสีเริ่มต้นที่คุณต้องการ
	// }

	// findParentNodeColor(node: CurriculumGroup) {
	// 	if (node.color !== '#FFFFFF') {
	// 		return node.color;
	// 	}
	// 	return this.findParentNodeColor(node.parent);
	// }

	findParentNodeColor(currentNode: CurriculumGroup, rootNode: CurriculumGroup): string {
		if (currentNode.color && currentNode.color !== '#FFFFFF') {
			return currentNode.color;
		}
		const parentNode = this.findParentNode(currentNode, rootNode);
		if (parentNode) {
			return this.findParentNodeColor(parentNode, rootNode);
		}
		return '#e7e5e4'; // หรือค่าสีเริ่มต้นที่คุณต้องการ
	}

	findNodeById(rootNode: CurriculumGroup, id: number): CurriculumGroup | null {
		if (rootNode.id === id) {
			return rootNode;
		}
		for (const child of rootNode.children) {
			const result = this.findNodeById(child, id);
			if (result) {
				return result;
			}
		}
		return null;
	}

	findParentNode(currentNode: CurriculumGroup, rootNode: CurriculumGroup): CurriculumGroup | null {
		if (currentNode.children.length === 0) {
			// ถ้า parent_id เป็น 0 แสดงว่าเป็นโหนดราก ไม่มีพาเรนต์
			return null;
		}
		return this.findNodeById(rootNode, currentNode.parent_id);
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

			case 'REQUIRED_CREDIT':
				if (group.subjects?.length) {
					for (const detail of this.transcript!.details) {
						if (totalUsed >= needed) {
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
								}
							}
						}
					}
				}
				break;

			case 'FREE':
				for (const detail of this.transcript!.details) {
					if (totalUsed >= needed) {
						break;
					}
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
