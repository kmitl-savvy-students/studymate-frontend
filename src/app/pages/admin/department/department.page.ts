import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-department',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: 'department.page.html',
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
		private alertService: AlertService,
	) {
		this.departmentCreateForm = this.fb.group({
			kmitlId: [''],
			nameTh: [''],
			nameEn: [''],
		});
		this.departmentEditForm = this.fb.group({
			kmitlId: [''],
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

	checkShowDepartment(): void {}

	// #region Fetchings
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

						if (this.departments.length != 0) {
							this.faculty = this.departments[0].faculty;
						} else {
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
	// #endregion
	// #region Navigations
	navigateToCurriculumType(id: number): void {
		this.loadingService.pulse(() => this.router.navigate([`/admin/program/${id}`]));
	}
	navigateToFaculty(): void {
		this.loadingService.pulse(() => this.router.navigate([`/admin/faculty`]));
	}
	// #endregion
	// #region Create
	onCreateDepartment(): void {
		this.departmentCreateForm.patchValue({
			kmitlId: [''],
			nameTh: '',
			nameEn: '',
		});
		this.createDepartmentModal.show();
	}
	onConfirmCreate(): void {
		if (this.departmentCreateForm.value.nameTh.trim().length == 0 || this.departmentCreateForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อภาควิชา');
			return;
		}
		this.createDepartmentModal.hide();

		const createdDepartment = {
			id: -1,
			kmitl_id: this.departmentCreateForm.value.kmitlId,
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
			kmitlId: department.kmitl_id,
			nameTh: department.name_th,
			nameEn: department.name_en,
		});
		this.editDepartmentModal.show();
	}
	onConfirmEdit(): void {
		if (!this.selectedDepartment) return;

		if (this.departmentEditForm.value.nameTh.trim().length == 0 || this.departmentEditForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อภาควิชา');
			return;
		}
		this.editDepartmentModal.hide();

		const updatedDepartment = {
			...this.selectedDepartment,
			kmitl_id: this.departmentEditForm.value.kmitlId,
			name_th: this.departmentEditForm.value.nameTh,
			name_en: this.departmentEditForm.value.nameEn,
		};
		this.updateDepartment(updatedDepartment);
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
