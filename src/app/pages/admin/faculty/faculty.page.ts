import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Faculty } from '@models/Faculty';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-faculty',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: 'faculty.page.html',
})
export class SDMPageFaculty implements OnInit {
	faculties: Faculty[] = [];
	isLoading = false;
	selectedFaculty: Faculty | null = null;
	facultyCreateForm: FormGroup;
	facultyEditForm: FormGroup;

	@ViewChild('createFacultyModal') createFacultyModal!: SDMBaseModal;
	@ViewChild('editFacultyModal') editFacultyModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private fb: FormBuilder,
		private loadingService: LoadingService,
		private alertService: AlertService,
	) {
		this.facultyCreateForm = this.fb.group({
			kmitlId: [''],
			nameTh: [''],
			nameEn: [''],
		});
		this.facultyEditForm = this.fb.group({
			kmitlId: [''],
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.fetchFaculties();
	}

	checkShowFaculty(faculty: Faculty): void {
		faculty.is_visible = !faculty.is_visible;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, faculty)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchFaculties();
					},
					error: (error) => {
						console.error('Error updating faculty:', error);
					},
				});
		});
	}

	// #region Fetchings
	fetchFaculties(): void {
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/get`;
		this.loadingService.show(() => {
			this.http
				.get<Faculty[]>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.faculties = data;
						this.isLoading = false;
					},
					error: (error) => {
						console.error('Error fetching faculties:', error);
						this.isLoading = false;
					},
				});
		});
	}
	// #endregion
	// #region Navigations
	navigateToDepartment(id: number): void {
		this.loadingService.pulse(() => this.router.navigate([`/admin/department/${id}`]));
	}
	// #endregion
	// #region Create
	onCreateFaculty(): void {
		this.facultyCreateForm.patchValue({
			kmitlId: '',
			nameTh: '',
			nameEn: '',
		});
		this.createFacultyModal.show();
	}
	onConfirmCreate(): void {
		if (this.facultyCreateForm.value.kmitlId.trim().length == 0 || this.facultyCreateForm.value.nameTh.trim().length == 0 || this.facultyCreateForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
			return;
		}
		this.createFacultyModal.hide();

		const createdFaculty = {
			id: -1,
			is_visible: false,
			kmitl_id: this.facultyCreateForm.value.kmitlId,
			name_th: this.facultyCreateForm.value.nameTh,
			name_en: this.facultyCreateForm.value.nameEn,
		};
		this.createFaculty(createdFaculty);
	}
	createFaculty(faculty: Faculty): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/create`;

		this.loadingService.show(() => {
			this.http
				.post(apiUrl, faculty)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchFaculties();
					},
					error: (error) => {
						console.error('Error creating faculty:', error);
					},
				});
		});
	}
	// #endregion
	// #region Edit
	onEditFaculty(faculty: Faculty): void {
		this.selectedFaculty = faculty;
		this.facultyEditForm.patchValue({
			kmitlId: faculty.kmitl_id,
			nameTh: faculty.name_th,
			nameEn: faculty.name_en,
		});
		this.editFacultyModal.show();
	}
	onConfirmEdit(): void {
		if (!this.selectedFaculty) return;

		if (this.facultyEditForm.value.kmitlId.trim().length == 0 || this.facultyEditForm.value.nameTh.trim().length == 0 || this.facultyEditForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
			return;
		}
		this.editFacultyModal.hide();

		const updatedFaculty = {
			...this.selectedFaculty,
			kmitl_id: this.facultyEditForm.value.kmitlId,
			name_th: this.facultyEditForm.value.nameTh,
			name_en: this.facultyEditForm.value.nameEn,
		};
		this.updateFaculty(updatedFaculty);
	}
	updateFaculty(faculty: Faculty): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, faculty)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchFaculties();
					},
					error: (error) => {
						console.error('Error updating faculty:', error);
					},
				});
		});
	}
	// #endregion
}
