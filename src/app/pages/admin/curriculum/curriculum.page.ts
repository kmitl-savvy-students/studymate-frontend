import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Curriculum } from '@models/Curriculum.model';
import { Program } from '@models/Program.model';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-curriculum',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: 'curriculum.page.html',
})
export class SDMPageCurriculum implements OnInit {
	programId: number | null = null;
	program: Program | null = null;

	curriculums: Curriculum[] = [];
	isLoading = false;
	selectedCurriculum: Curriculum | null = null;
	curriculumCreateForm: FormGroup;
	curriculumEditForm: FormGroup;

	@ViewChild('createCurriculumModal') createCurriculumModal!: SDMBaseModal;
	@ViewChild('editCurriculumModal') editCurriculumModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private loadingService: LoadingService,
		private alertService: AlertService,
	) {
		this.curriculumCreateForm = this.fb.group({
			year: [0],
			nameTh: [''],
			nameEn: [''],
		});
		this.curriculumEditForm = this.fb.group({
			year: [0],
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('programId');
			if (id) {
				this.programId = +id;
				this.fetchCurriculums();
			}
		});
	}

	// #region Fetchings
	fetchCurriculums(): void {
		if (!this.programId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/get-by-program/${this.programId}`;

		this.loadingService.show(() => {
			this.http
				.get<Curriculum[]>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.curriculums = data;
						this.curriculums.sort((a, b) => b.year - a.year);
						this.isLoading = false;

						if (this.curriculums.length != 0) {
							this.program = this.curriculums[0].program;
						} else {
							this.fetchProgram();
						}
					},
					error: (error) => {
						console.error('Error fetching curriculums:', error);
						this.isLoading = false;
					},
				});
		});
	}
	fetchProgram(): void {
		if (!this.programId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/program/get/${this.programId}`;

		this.loadingService.show(() => {
			this.http
				.get<Program>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.program = data;
						this.isLoading = false;
					},
					error: (error) => {
						console.error('Error fetching program:', error);
						this.isLoading = false;
					},
				});
		});
	}
	// #endregion
	// #region Navigations
	navigateToCurriculumGroup(id: number): void {
		this.loadingService.pulse(() => this.router.navigate([`/admin/curriculum-group/${id}`]));
	}
	navigateToProgram(): void {
		if (!this.programId) return;

		this.loadingService.pulse(() => this.router.navigate([`/admin/program/${this.program?.department?.id}`]));
	}
	// #endregion
	// #region Create
	onCreateCurriculum(): void {
		this.curriculumCreateForm.patchValue({
			year: new Date().getFullYear() + 543,
			nameTh: '',
			nameEn: '',
		});
		this.createCurriculumModal.show();
	}
	onConfirmCreate(): void {
		if (this.curriculumCreateForm.value.nameTh.trim().length == 0 || this.curriculumCreateForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อหลักสูตร');
			return;
		}
		this.createCurriculumModal.hide();

		const createdCurriculum = {
			id: -1,
			program: this.program,
			year: this.curriculumCreateForm.value.year,
			name_th: this.curriculumCreateForm.value.nameTh,
			name_en: this.curriculumCreateForm.value.nameEn,
			curriculum_group: null,
		};
		this.createCurriculum(createdCurriculum);
	}
	createCurriculum(curriculum: Curriculum): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/create`;

		this.loadingService.show(() => {
			this.http
				.post(apiUrl, curriculum)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchCurriculums();
					},
					error: (error) => {
						console.error('Error creating curriculum:', error);
					},
				});
		});
	}
	// #endregion
	// #region Edit
	onEditCurriculum(curriculum: Curriculum): void {
		this.selectedCurriculum = curriculum;
		this.curriculumEditForm.patchValue({
			year: curriculum.year,
			nameTh: curriculum.name_th,
			nameEn: curriculum.name_en,
		});
		this.editCurriculumModal.show();
	}
	onConfirmEdit(): void {
		if (!this.selectedCurriculum) return;

		if (this.curriculumEditForm.value.nameTh.trim().length == 0 || this.curriculumEditForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อหลักสูตร');
			return;
		}
		this.editCurriculumModal.hide();

		const updatedCurriculum = {
			...this.selectedCurriculum,
			year: this.curriculumEditForm.value.year,
			name_th: this.curriculumEditForm.value.nameTh,
			name_en: this.curriculumEditForm.value.nameEn,
			curriculum_group: null,
		};
		this.updateCurriculum(updatedCurriculum);
	}
	updateCurriculum(curriculum: Curriculum): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, curriculum)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchCurriculums();
					},
					error: (error) => {
						console.error('Error updating curriculum:', error);
					},
				});
		});
	}
	// #endregion
}
