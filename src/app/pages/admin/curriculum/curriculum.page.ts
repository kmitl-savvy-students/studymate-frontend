import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SDMBaseButton } from '../../../components/buttons/base-button.component';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../../../shared/services/backend.service';
import { CommonModule } from '@angular/common';
import { SDMBaseModal } from '../../../components/modals/base-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { finalize } from 'rxjs';
import { CurriculumType } from '../../../shared/models/CurriculumType.model';
import { Curriculum } from '../../../shared/models/Curriculum.model';

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

	@ViewChild('createCurriculumModal')
	createCurriculumModal!: SDMBaseModal;
	@ViewChild('editCurriculumModal')
	editCurriculumModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private loadingService: LoadingService,
	) {
		this.curriculumCreateForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
		this.curriculumEditForm = this.fb.group({
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
						this.isLoading = false;

						if (this.curriculums.length != 0)
							this.curriculumType =
								this.curriculums[0].curriculum_type;
						else {
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

	// #region Navigations
	navigateToCurriculumGroup(id: number): void {
		this.loadingService.pulse(() =>
			this.router.navigate([`/admin/curriculum-group/${id}`]),
		);
	}
	navigateToCurriculumType(): void {
		if (!this.curriculumTypeId) return;

		this.loadingService.pulse(() =>
			this.router.navigate([
				`/admin/curriculum-type/${this.curriculumType?.department?.id}`,
			]),
		);
	}
	// #endregion
	// #region Create
	onCreateCurriculum(): void {
		this.curriculumCreateForm.patchValue({
			nameTh: '',
			nameEn: '',
		});
		this.createCurriculumModal.show();
	}
	onConfirmCreate(): void {
		const createdCurriculum = {
			id: -1,
			curriculum_type: this.curriculumType,
			year: -1,
			name_th: this.curriculumCreateForm.value.nameTh,
			name_en: this.curriculumCreateForm.value.nameEn,
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
			nameTh: curriculum.name_th,
			nameEn: curriculum.name_en,
		});
		this.editCurriculumModal.show();
	}
	onConfirmEdit(): void {
		if (this.selectedCurriculum) {
			const updatedCurriculum = {
				...this.selectedCurriculum,
				name_th: this.curriculumEditForm.value.nameTh,
				name_en: this.curriculumEditForm.value.nameEn,
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
