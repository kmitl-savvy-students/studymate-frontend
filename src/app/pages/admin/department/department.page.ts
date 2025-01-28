import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SDMBaseButton } from '../../../components/buttons/base-button.component';
import { Router, ActivatedRoute } from '@angular/router';
import { BackendService } from '../../../shared/services/backend.service';
import { CommonModule } from '@angular/common';
import { SDMBaseModal } from '../../../components/modals/base-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Department } from '../../../shared/models/Department';
import { Faculty } from '../../../shared/models/Faculty';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-department',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: './department.page.html',
})
export class SDMPageDepartment implements OnInit {
	facultyId: number | null = null;
	faculty: Faculty | null = null;

	departments: Department[] = [];
	isLoading = false;
	selectedDepartment: Department | null = null;
	departmentCreateForm: FormGroup;
	departmentEditForm: FormGroup;

	@ViewChild('createDepartmentModal') createDepartmentModal!: SDMBaseModal;
	@ViewChild('editDepartmentModal') editDepartmentModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private loadingService: LoadingService,
	) {
		this.departmentCreateForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
		this.departmentEditForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('facultyId');
			if (id) {
				this.facultyId = +id;
				this.fetchDepartments();
			}
		});
	}

	fetchDepartments(): void {
		if (!this.facultyId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/department/get-by-faculty/${this.facultyId}`;

		this.loadingService.show(() => {
			this.http
				.get<Department[]>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.departments = data;
						this.isLoading = false;

						if (this.departments.length != 0)
							this.faculty = this.departments[0].faculty;
						else {
							this.fetchFaculty();
						}
					},
					error: (error) => {
						console.error('Error fetching departments:', error);
						this.isLoading = false;
					},
				});
		});
	}
	fetchFaculty(): void {
		if (!this.facultyId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/get/${this.facultyId}`;

		this.loadingService.show(() => {
			this.http
				.get<Faculty>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.faculty = data;
						this.isLoading = false;
					},
					error: (error) => {
						console.error('Error fetching faculty:', error);
						this.isLoading = false;
					},
				});
		});
	}

	// #region Navigations
	navigateToCurriculumType(id: number): void {
		this.loadingService.pulse(() =>
			this.router.navigate([`/admin/curriculum-type/${id}`]),
		);
	}
	navigateToFaculty(): void {
		this.loadingService.pulse(() =>
			this.router.navigate([`/admin/faculty`]),
		);
	}
	// #endregion
	// #region Create
	onCreateDepartment(): void {
		this.departmentCreateForm.patchValue({
			nameTh: '',
			nameEn: '',
		});
		this.createDepartmentModal.show();
	}
	onConfirmCreate(): void {
		const createdDepartment = {
			id: -1,
			faculty: this.faculty,
			name_th: this.departmentCreateForm.value.nameTh,
			name_en: this.departmentCreateForm.value.nameEn,
		};
		this.createDepartment(createdDepartment);
	}
	createDepartment(department: Department): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/department/create`;

		this.loadingService.show(() => {
			this.http
				.post(apiUrl, department)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchDepartments();
					},
					error: (error) => {
						console.error('Error creating department:', error);
					},
				});
		});
	}
	// #endregion
	// #region Edit
	onEditDepartment(department: Department): void {
		this.selectedDepartment = department;
		this.departmentEditForm.patchValue({
			nameTh: department.name_th,
			nameEn: department.name_en,
		});
		this.editDepartmentModal.show();
	}
	onConfirmEdit(): void {
		if (this.selectedDepartment) {
			const updatedDepartment = {
				...this.selectedDepartment,
				name_th: this.departmentEditForm.value.nameTh,
				name_en: this.departmentEditForm.value.nameEn,
			};
			this.updateDepartment(updatedDepartment);
		}
	}
	updateDepartment(department: Department): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/department/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, department)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchDepartments();
					},
					error: (error) => {
						console.error('Error updating department:', error);
					},
				});
		});
	}
	// #endregion
}
