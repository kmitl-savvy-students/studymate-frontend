import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Curriculum } from '@models/Curriculum.model';
import { CurriculumType } from '@models/CurriculumType.model';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-curriculum',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: './curriculum.page.html',
})
export class SDMPageCurriculum implements OnInit {
	curriculumTypeId: number | null = null;
	curriculumType: CurriculumType | null = null;

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
			const id = params.get('curriculumTypeId');
			if (id) {
				this.curriculumTypeId = +id;
				this.fetchCurriculums();
			}
		});
	}

	// #region Fetchings
	fetchCurriculums(): void {
		if (!this.curriculumTypeId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/get-by-curriculum-type/${this.curriculumTypeId}`;

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
							this.curriculumType = this.curriculums[0].curriculum_type;
						} else {
							this.fetchCurriculumType();
						}
					},
					error: (error) => {
						console.error('Error fetching curriculums:', error);
						this.isLoading = false;
					},
				});
		});
	}
	fetchCurriculumType(): void {
		if (!this.curriculumTypeId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-type/get/${this.curriculumTypeId}`;

		this.loadingService.show(() => {
			this.http
				.get<CurriculumType>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.curriculumType = data;
						this.isLoading = false;
					},
					error: (error) => {
						console.error('Error fetching curriculum type:', error);
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
	navigateToCurriculumType(): void {
		if (!this.curriculumTypeId) return;

		this.loadingService.pulse(() => this.router.navigate([`/admin/curriculum-type/${this.curriculumType?.department?.id}`]));
	}
	// #endregion
	// #region Create
	onCreateCurriculum(): void {
		this.curriculumCreateForm.patchValue({
			year: 0,
			nameTh: '',
			nameEn: '',
		});
		this.createCurriculumModal.show();
	}
	onConfirmCreate(): void {
		const createdCurriculum = {
			id: -1,
			curriculum_type: this.curriculumType,
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
		if (this.selectedCurriculum) {
			const updatedCurriculum = {
				...this.selectedCurriculum,
				year: this.curriculumEditForm.value.year,
				name_th: this.curriculumEditForm.value.nameTh,
				name_en: this.curriculumEditForm.value.nameEn,
				curriculum_group: null,
			};
			this.updateCurriculum(updatedCurriculum);
		}
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
