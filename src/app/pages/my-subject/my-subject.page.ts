import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SDMConfirmDeleteModalComponent } from '../../components/modals/delete-modal/confirm-delete-modal.component';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { BackendService } from '../../shared/services/backend.service';
import { AlertService } from '../../shared/services/alert/alert.service';
import { User } from '../../shared/models/User.model';
import { TranscriptData } from '../../shared/models/TranscriptData.model';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		CommonModule,
		SDMConfirmDeleteModalComponent,
		ImportTranscriptComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMMySubject implements OnInit, AfterViewInit {
	transcriptData: TranscriptData[] = [];
	curriculumName = '';
	isDataLoaded = false;
	errorMessage: string | null = null;
	currentUser: User | null = null;
	curriculumCategories: any[] = [];
	usedSubjectIds = new Set<string>();

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			if (!user) {
				this.errorMessage = 'No authenticated user found.';
				this.isDataLoaded = true;
				return;
			}
			const cur = user.curriculum;
			this.curriculumName = cur?.name_th || 'ไม่พบข้อมูลหลักสูตร';
			this.fetchTranscriptData(user.id);
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	fetchTranscriptData(userId: string) {
		const url = `${this.backendService.getBackendUrl()}/api/transcript/get/${userId}`;
		this.http.get<TranscriptData[]>(url).subscribe({
			next: (data) => {
				this.transcriptData = data || [];
				if (this.currentUser?.curriculum) {
					const { unique_id, year } = this.currentUser.curriculum;
					this.loadCategoriesData(unique_id, year);
				} else {
					this.isDataLoaded = true;
				}
			},
			error: () => {
				this.errorMessage = 'ไม่พบข้อมูล Transcript';
				this.isDataLoaded = true;
			},
		});
	}

	deleteTranscriptData() {
		if (!this.currentUser?.id) {
			this.alertService.showAlert('error', 'ไม่พบข้อมูลผู้ใช้งาน');
			return;
		}
		const url = `${this.backendService.getBackendUrl()}/api/transcript/delete/${this.currentUser.id}`;
		this.http.delete(url).subscribe({
			next: () => {
				this.alertService.showAlert('success', 'ลบข้อมูลสำเร็จ!');
				window.location.reload();
			},
			error: (err) => {
				if (err.status == 404) {
					this.alertService.showAlert(
						'warning',
						'ไม่พบข้อมูลที่ต้องการลบ',
					);
				} else {
					this.alertService.showAlert(
						'error',
						'เกิดข้อผิดพลาดในการลบข้อมูล',
					);
				}
			},
		});
	}

	loadCategoriesData(uniqueId: string, year: string) {
		const url = `${this.backendService.getBackendUrl()}/api/curriculum-category/query/${uniqueId}/${year}`;
		this.http.get<any[]>(url).subscribe({
			next: (cats) => {
				this.curriculumCategories = cats || [];
				this.loadCategoryRecursive(uniqueId, year, 0);
			},
			error: () => {
				this.errorMessage = 'Failed to load categories.';
				this.isDataLoaded = true;
			},
		});
	}

	loadCategoryRecursive(uniqueId: string, year: string, index: number) {
		if (index >= this.curriculumCategories.length) {
			this.placeUnusedSubjectsInCategory3();
			this.isDataLoaded = true;
			return;
		}
		const cat = this.curriculumCategories[index];
		cat.isOpen = false;

		const groupUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group/query/${uniqueId}/${year}/${cat.c_cat_id}`;
		this.http.get<any[]>(groupUrl).subscribe({
			next: (groups) => {
				cat.curriculum_groups = groups || [];
				this.loadGroups(uniqueId, year, cat, 0, () => {
					this.loadCategoryRecursive(uniqueId, year, index + 1);
				});
			},
			error: () => {
				this.isDataLoaded = true;
			},
		});
	}

	loadGroups(
		uniqueId: string,
		year: string,
		cat: any,
		gIdx: number,
		done: Function,
	) {
		if (!cat.curriculum_groups || gIdx >= cat.curriculum_groups.length) {
			done();
			return;
		}
		const g = cat.curriculum_groups[gIdx];
		g.isOpen = false;

		const subgroupUrl = `${this.backendService.getBackendUrl()}/api/curriculum-subgroup/query/${uniqueId}/${year}/${cat.c_cat_id}/${g.group_id}`;
		this.http.get<any[]>(subgroupUrl).subscribe({
			next: (subs) => {
				g.curriculum_subgroup = subs || [];
				this.loadSubgroups(uniqueId, year, cat, g, 0, () => {
					this.loadGroups(uniqueId, year, cat, gIdx + 1, done);
				});
			},
			error: () => {
				done();
			},
		});
	}

	loadSubgroups(
		uniqueId: string,
		year: string,
		cat: any,
		g: any,
		sgIdx: number,
		done: Function,
	) {
		if (!g.curriculum_subgroup || sgIdx >= g.curriculum_subgroup.length) {
			done();
			return;
		}
		const sg = g.curriculum_subgroup[sgIdx];
		sg.isOpen = false;

		const subjectUrl = `${this.backendService.getBackendUrl()}/api/curriculum-subject/query/${uniqueId}/${year}/${cat.c_cat_id}/${g.group_id}/${sg.subgroup_id}`;
		this.http.get<any[]>(subjectUrl).subscribe({
			next: (subs) => {
				let total = 0;
				const maxNeeded = sg.credit1 || 999999;
				const result = [];
				for (const s of subs || []) {
					if (!s.subject?.id) continue;
					if (this.usedSubjectIds.has(s.subject.id)) continue;
					const match = this.transcriptData.find(
						(t) => t.subject?.id == s.subject.id && t.grade != 'X',
					);
					if (!match) continue;
					const c = s.subject.credit || 0;
					if (total + c > maxNeeded) break;
					result.push(s);
					this.usedSubjectIds.add(s.subject.id);
					total += c;
				}
				sg.curriculum_subjects = result;
				this.loadSubgroups(uniqueId, year, cat, g, sgIdx + 1, done);
			},
			error: () => {
				done();
			},
		});
	}

	placeUnusedSubjectsInCategory3() {
		const leftover = this.transcriptData.filter(
			(t) =>
				t.grade != 'X' && !this.usedSubjectIds.has(t.subject?.id || ''),
		);
		if (!leftover.length) return;

		let cat3 = this.curriculumCategories.find((c) => c.c_cat_id == '3');
		if (!cat3) {
			cat3 = {
				c_cat_id: '3',
				curriculum_groups: [],
				isOpen: false,
				credit1: 0,
			};
			this.curriculumCategories.push(cat3);
		}

		let grp = cat3.curriculum_groups.find((g: any) => g.group_id == '9999');
		if (!grp) {
			grp = {
				group_id: '9999',
				group_name: 'Leftover Group',
				curriculum_subgroup: [],
				isOpen: false,
				credit1: 0,
			};
			cat3.curriculum_groups.push(grp);
		}

		let sg = grp.curriculum_subgroup.find(
			(sb: any) => sb.subgroup_id == '9999',
		);
		if (!sg) {
			sg = {
				subgroup_id: '9999',
				subgroup_name: 'Leftover Subgroup',
				curriculum_subjects: [],
				isOpen: false,
				credit1: 0,
			};
			grp.curriculum_subgroup.push(sg);
		}

		for (const t of leftover) {
			if (!t.subject?.id) continue;
			this.usedSubjectIds.add(t.subject.id);
			sg.curriculum_subjects.push({ subject: t.subject });
		}
	}

	hasTranscriptSubjects(sg: any) {
		return !!sg.curriculum_subjects?.length;
	}

	toggleCategory(cat: any) {
		cat.isOpen = !cat.isOpen;
	}

	toggleGroup(g: any) {
		g.isOpen = !g.isOpen;
	}

	toggleSubgroup(sg: any) {
		sg.isOpen = !sg.isOpen;
	}

	hasSubjectInTranscript(subjectId: string) {
		return this.transcriptData.some(
			(t) => t.subject?.id == subjectId && t.grade != 'X',
		);
	}

	getGrade(subjectId: string) {
		const match = this.transcriptData.find(
			(t) => t.subject?.id == subjectId,
		);
		return match?.grade || '-';
	}

	calculateAccumulatedCredits(): number {
		return this.transcriptData
			.filter((t) => t.grade != 'X')
			.reduce((sum, t) => sum + (t.subject?.credit || 0), 0);
	}

	getCategoryCredits(cat: any): number {
		let total = 0;
		cat.curriculum_groups?.forEach((g: any) => {
			g.curriculum_subgroup?.forEach((sg: any) => {
				sg.curriculum_subjects?.forEach((sub: any) => {
					const found = this.transcriptData.find(
						(t) =>
							t.subject?.id == sub.subject.id && t.grade != 'X',
					);
					if (found) total += sub.subject.credit || 0;
				});
			});
		});
		return total;
	}

	getGroupCredits(g: any): number {
		let total = 0;
		g.curriculum_subgroup?.forEach((sg: any) => {
			sg.curriculum_subjects?.forEach((sub: any) => {
				const found = this.transcriptData.find(
					(t) => t.subject?.id == sub.subject.id && t.grade != 'X',
				);
				if (found) total += sub.subject.credit || 0;
			});
		});
		return total;
	}

	getSubgroupCredits(sg: any): number {
		let total = 0;
		sg.curriculum_subjects?.forEach((sub: any) => {
			const found = this.transcriptData.find(
				(t) => t.subject?.id == sub.subject.id && t.grade != 'X',
			);
			if (found) total += sub.subject.credit || 0;
		});
		return total;
	}

	isCategoryFulfilled(cat: any): boolean {
		if (!cat.credit1) return false;
		return this.getCategoryCredits(cat) >= cat.credit1;
	}

	isGroupFulfilled(g: any): boolean {
		if (!g.credit1) return false;
		return this.getGroupCredits(g) >= g.credit1;
	}

	isSubgroupFulfilled(sg: any): boolean {
		if (!sg.credit1) return false;
		return this.getSubgroupCredits(sg) >= sg.credit1;
	}
}
