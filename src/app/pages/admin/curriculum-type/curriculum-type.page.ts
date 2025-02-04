import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { CurriculumType } from '@models/CurriculumType.model';
import { Department } from '@models/Department';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-curriculum-type',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: './curriculum-type.page.html',
})
export class SDMPageCurriculumType implements OnInit {
	departmentId: number | null = null;
	department: Department | null = null;

	curriculumTypes: CurriculumType[] = [];
	isLoading = false;
	selectedCurriculumType: CurriculumType | null = null;
	curriculumTypeCreateForm: FormGroup;
	curriculumTypeEditForm: FormGroup;

	@ViewChild('createCurriculumTypeModal') createCurriculumTypeModal!: SDMBaseModal;
	@ViewChild('editCurriculumTypeModal') editCurriculumTypeModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private loadingService: LoadingService,
	) {
		this.curriculumTypeCreateForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
		this.curriculumTypeEditForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('departmentId');
			if (id) {
				this.departmentId = +id;
				this.fetchCurriculumTypes();
			}
		});
	}

	// #region Fetchings
	fetchCurriculumTypes(): void {
		if (!this.departmentId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-type/get-by-department/${this.departmentId}`;

		this.loadingService.show(() => {
			this.http
				.get<CurriculumType[]>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.curriculumTypes = data;
						this.isLoading = false;

						if (this.curriculumTypes.length != 0) {
							this.department = this.curriculumTypes[0].department;
						} else {
							this.fetchDepartment();
						}
					},
					error: (error) => {
						console.error('Error fetching curriculum types:', error);
						this.isLoading = false;
					},
				});
		});
	}
	fetchDepartment(): void {
		if (!this.departmentId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/department/get/${this.departmentId}`;

		this.loadingService.show(() => {
			this.http
				.get<Department>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.department = data;
						this.isLoading = false;
					},
					error: (error) => {
						console.error('Error fetching department:', error);
						this.isLoading = false;
					},
				});
		});
	}
	// #endregion
	// #region Navigations
	navigateToCurriculum(id: number): void {
		this.loadingService.pulse(() => this.router.navigate([`/admin/curriculum/${id}`]));
	}
	navigateToDepartment(): void {
		if (!this.departmentId) return;

		this.loadingService.pulse(() => this.router.navigate([`/admin/department/${this.department?.faculty?.id}`]));
	}
	// #endregion
	// #region Create
	onCreateCurriculumType(): void {
		this.curriculumTypeCreateForm.patchValue({
			nameTh: '',
			nameEn: '',
		});
		this.createCurriculumTypeModal.show();
	}
	onConfirmCreate(): void {
		const createdCurriculumType = {
			id: -1,
			department: this.department,
			name_th: this.curriculumTypeCreateForm.value.nameTh,
			name_en: this.curriculumTypeCreateForm.value.nameEn,
		};
		this.createCurriculumType(createdCurriculumType);
	}
	createCurriculumType(curriculumType: CurriculumType): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-type/create`;

		this.loadingService.show(() => {
			this.http
				.post(apiUrl, curriculumType)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchCurriculumTypes();
					},
					error: (error) => {
						console.error('Error creating curriculum type:', error);
					},
				});
		});
	}
	// #endregion
	// #region Edit
	onEditCurriculumType(curriculumType: CurriculumType): void {
		this.selectedCurriculumType = curriculumType;
		this.curriculumTypeEditForm.patchValue({
			nameTh: curriculumType.name_th,
			nameEn: curriculumType.name_en,
		});
		this.editCurriculumTypeModal.show();
	}
	onConfirmEdit(): void {
		if (this.selectedCurriculumType) {
			const updatedCurriculumType = {
				...this.selectedCurriculumType,
				name_th: this.curriculumTypeEditForm.value.nameTh,
				name_en: this.curriculumTypeEditForm.value.nameEn,
			};
			this.updateCurriculumType(updatedCurriculumType);
		}
	}
	updateCurriculumType(curriculumType: CurriculumType): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum-type/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, curriculumType)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchCurriculumTypes();
					},
					error: (error) => {
						console.error('Error updating curriculum type:', error);
					},
				});
		});
	}
	// #endregion
}
