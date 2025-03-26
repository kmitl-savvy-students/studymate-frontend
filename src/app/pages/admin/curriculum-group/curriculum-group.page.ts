import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Curriculum } from '@models/Curriculum.model';
import { CurriculumGroup } from '@models/CurriculumGroup.model';
import { CurriculumGroupSubject } from '@models/CurriculumGroupSubject';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
	selector: 'sdm-page-curriculum-group',
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule, SDMBaseModal, SDMBaseButton, IconComponent],
	templateUrl: 'curriculum-group.page.html',
	styleUrl: 'curriculum-group.page.css',
	providers: [Clipboard],
})
export class SDMPageCurriculumGroup implements OnInit {
	curriculumId: number | null = null;
	curriculum: Curriculum | null = null;

	curriculumGroupSubjects: Array<CurriculumGroupSubject> = [];
	isFetchingCurriculumGroupSubjects = false;

	rootNode: CurriculumGroup | null = null;

	addNodeForm: FormGroup;
	editNodeForm: FormGroup;
	addSubjectForm: FormGroup;

	@ViewChild('addNodeModal') addNodeModal!: SDMBaseModal;
	@ViewChild('editNodeModal') editNodeModal!: SDMBaseModal;
	@ViewChild('editSubjectsModal') editSubjectsModal!: SDMBaseModal;
	@ViewChild('addSubjectModal') addSubjectModal!: SDMBaseModal;

	currentParentNode: CurriculumGroup | null = null;
	originalParentNode: CurriculumGroup | null = null;

	private clipboard = inject(Clipboard);

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private route: ActivatedRoute,
		private router: Router,
		private fb: FormBuilder,
		private loadingService: LoadingService,
		private alertService: AlertService,
	) {
		this.addNodeForm = this.fb.group({
			name: [''],
			type: ['REQUIRED_ALL'],
			credit: 0,
			branch: 1,
			color: ['#FFFFFF'],
		});
		this.editNodeForm = this.fb.group({
			name: [''],
			type: ['REQUIRED_ALL'],
			credit: 0,
			branch: 1,
			color: ['#FFFFFF'],
		});
		this.addSubjectForm = this.fb.group({
			subjects: [''],
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('curriculumId');
			if (id) {
				this.curriculumId = +id;
				this.fetchCurriculumAndNode();
			}
		});
	}

	findParentNodeColor(currentNode: CurriculumGroup): string {
		const GRAY = '#e7e5e4';
		if (currentNode.color.toUpperCase() !== '#FFFFFF' && currentNode.color.length !== 0) {
			return currentNode.color;
		}
		const parentNode = this.findNodeById(currentNode.parent_id, this.rootNode);
		if (!parentNode) return GRAY;

		return this.findParentNodeColor(parentNode);
	}

	findNodeById(id: number, currentNode: CurriculumGroup | null): CurriculumGroup | null {
		if (!currentNode) return null;

		if (currentNode.id === id) {
			return currentNode;
		}
		for (let child of currentNode.children) {
			const result = this.findNodeById(id, child);
			if (result) {
				return result;
			}
		}
		return null;
	}

	// #region Fetchings
	fetchCurriculumAndNode(): void {
		if (!this.curriculumId) return;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/get/${this.curriculumId}`;

		this.loadingService.show(() => {
			this.http
				.get<Curriculum>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.curriculum = data;

						if (data.curriculum_group) this.rootNode = data.curriculum_group;
						else this.createRootNode();
					},
					error: (error) => {
						console.error('Error fetching curriculum and root node:', error);
					},
				});
		});
	}

	fetchCurriculumGroupSubjects(): void {
		if (!this.currentParentNode) return;
		this.isFetchingCurriculumGroupSubjects = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group-subject/get-by-curriculum-group/${this.currentParentNode.id}`;

		this.http
			.get<Array<CurriculumGroupSubject>>(apiUrl)
			.pipe(
				finalize(() => {
					this.loadingService.hide();
					this.isFetchingCurriculumGroupSubjects = false;
				}),
			)
			.subscribe({
				next: (data) => {
					this.curriculumGroupSubjects = data.slice().sort((a: any, b: any) => parseInt(a.subject?.id) - parseInt(b.subject?.id));
				},
				error: (error) => {
					console.error('Error fetching curriculum group subjects:', error);
				},
			});
	}

	// #endregion
	// #region Navigations
	navigateToCurriculum(): void {
		if (!this.curriculumId) return;

		this.loadingService.pulse(() => this.router.navigate([`/admin/curriculum/${this.curriculum?.program?.id}`]));
	}
	// #endregion
	// #region Update Root Node
	createRootNode(): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group/create`;
		const payload: CurriculumGroup = {
			id: -1,
			parent_id: -1,
			name: 'Root',
			type: 'REQUIRED_ALL',
			credit: 0,
			branch: 1,
			color: '#FFFFFF',
			children: [],
			subjects: [],
		};

		this.loadingService.show(() => {
			this.http
				.post<CurriculumGroup>(apiUrl, payload)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: (data) => {
						this.rootNode = data;
						this.updateCurriculumRoot();
					},
					error: () => {
						console.error('Error creating root node');
					},
				});
		});
	}
	updateCurriculumRoot(): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/update`;
		const updatedCurriculum = {
			...this.curriculum,
			curriculum_group: this.rootNode,
		};
		this.loadingService.show(() => {
			this.http
				.put(apiUrl, updatedCurriculum)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchCurriculumAndNode();
					},
					error: (error) => {
						console.error('Error updating curriculum:', error);
					},
				});
		});
	}
	// #endregion
	// #region Add Node
	onAddChildNode(node: CurriculumGroup): void {
		this.currentParentNode = { ...node };
		this.addNodeForm.reset({
			name: '',
			type: 'REQUIRED_ALL',
			credit: 0,
			branch: 1,
			color: '#FFFFFF',
		});
		this.addNodeModal.show();
	}
	onConfirmAddNode(): void {
		if (!this.currentParentNode) return;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group/create`;
		const payload: CurriculumGroup = {
			id: -1,
			parent_id: this.currentParentNode.id,
			name: this.addNodeForm.value.name,
			type: this.addNodeForm.value.type,
			credit: this.addNodeForm.value.credit,
			branch: this.addNodeForm.value.branch,
			color: this.addNodeForm.value.color,
			children: [],
			subjects: [],
		};
		this.loadingService.show(() => {
			this.http
				.post(apiUrl, payload)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.fetchCurriculumAndNode();
						this.addNodeModal.hide();
					},
					error: () => {
						console.error('Error adding child node');
					},
				});
		});
	}
	// #endregion
	// #region Edit Node
	onEditNode(node: CurriculumGroup): void {
		node.branch = 1;

		this.editSubjectsModal.hide();
		this.editNodeModal.show();
		this.currentParentNode = { ...node };
		this.originalParentNode = { ...node };
		this.editNodeForm.patchValue({
			name: node.name,
			type: node.type,
			credit: node.credit,
			branch: node.branch,
			color: node.color,
		});
		if (this.editNodeForm.value.color.length === 0) {
			this.editNodeForm.patchValue({ color: '#FFFFFF' });
		}
	}
	onCancelEditNode(): void {
		if (this.alertUnsaved()) return;
		this.editNodeModal.hide();
	}
	onUpdateNodeType(event: any): void {
		if (!this.currentParentNode) return;
		this.currentParentNode.type = event.target.value;
		this.currentParentNode.credit = 0;
	}
	onConfirmEditNode(): void {
		if (!this.currentParentNode) return;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group/update`;
		const payload: CurriculumGroup = {
			id: this.currentParentNode.id,
			parent_id: this.currentParentNode.parent_id,
			name: this.editNodeForm.value.name,
			type: this.editNodeForm.value.type,
			credit: this.editNodeForm.value.credit,
			branch: this.editNodeForm.value.branch,
			color: this.editNodeForm.value.color,
			children: [],
			subjects: [],
		};
		this.loadingService.show(() => {
			this.http
				.put(apiUrl, payload)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.fetchCurriculumAndNode();
						this.editNodeModal.hide();
					},
					error: () => {
						console.error('Error editing child node');
					},
				});
		});
	}
	alertUnsaved(): boolean {
		if (this.originalParentNode?.type != this.currentParentNode?.type || this.editNodeForm.value.credit != this.currentParentNode?.credit || this.editNodeForm.value.branch != this.currentParentNode?.branch) {
			alert('คำเตือน คุณยังไม่ได้บันทึกข้อมูลที่แก้ไข');
			return true;
		}
		return false;
	}
	// #endregion
	// #region Delete Node
	onDeleteNode(node: any): void {
		if (node.children && node.children.length > 0) {
			alert('Please remove all child nodes first.');
			return;
		}
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group/delete/${node.id}`;
		this.loadingService.show(() => {
			this.http
				.delete(apiUrl)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.fetchCurriculumAndNode();
					},
					error: () => {
						console.error('Error deleting node');
					},
				});
		});
	}
	// #endregion
	// #region Edit Subjects
	onCopyAllSubject(): void {
		if (!this.currentParentNode) return;

		let subjectsString = this.currentParentNode.subjects.flatMap((subject) => subject.subject?.id).join(',');
		this.clipboard.copy(subjectsString);
		this.alertService.showAlert('success', 'คัดลอกรายวิชาสำเร็จ!');
	}
	onDeleteAllSubject(): void {
		if (!this.currentParentNode) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group-subject/delete-all/${this.currentParentNode.id}`;
		this.loadingService.show(() => {
			this.http
				.delete(apiUrl)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.fetchCurriculumGroupSubjects();
						this.fetchCurriculumAndNode();
					},
					error: () => {
						console.error('Error delete subjects');
					},
				});
		});
	}

	onEditSubjects(): void {
		if (this.alertUnsaved()) return;

		this.fetchCurriculumGroupSubjects();
		this.editNodeModal.hide();
		this.editSubjectsModal.show();
	}
	onAddSubject(): void {
		this.addSubjectForm.reset({ subjects: '' });
		this.editSubjectsModal.hide();
		this.addSubjectModal.show();
	}
	onConfirmAddSubject(): void {
		if (!this.currentParentNode) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group-subject/create`;
		const payload: any = {
			curriculum_group_id: this.currentParentNode.id,
			subject_string: this.addSubjectForm.value.subjects,
		};
		this.loadingService.show(() => {
			this.http
				.post(apiUrl, payload)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.editSubjectsModal.show();
						this.addSubjectModal.hide();
						this.fetchCurriculumGroupSubjects();
						this.fetchCurriculumAndNode();
					},
					error: () => {
						console.error('Error adding subject');
					},
				});
		});
	}
	onDeleteSubject(curriculumGroupSubjectId: number): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-group-subject/delete/${curriculumGroupSubjectId}`;
		this.loadingService.show(() => {
			this.http
				.delete(apiUrl)
				.pipe(finalize(() => this.loadingService.hide()))
				.subscribe({
					next: () => {
						this.fetchCurriculumGroupSubjects();
					},
					error: () => {
						console.error('Error deleting subject');
					},
				});
		});
	}
	// #endregion
}
