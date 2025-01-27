import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SDMBaseButton } from '../../../components/buttons/base-button.component';
import { Router } from '@angular/router';
import { BackendService } from '../../../shared/services/backend.service';
import { Faculty } from '../../../shared/models/Faculty';
import { CommonModule } from '@angular/common';
import { SDMBaseModal } from '../../../components/modals/base-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoadingService } from '../../../shared/services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-faculty',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: './faculty.page.html',
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
	) {
		this.facultyCreateForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
		this.facultyEditForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.fetchFaculties();
	}

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

	navigateToDepartment(id: number): void {
		this.loadingService.pulse(() =>
			this.router.navigate([`/admin/department/${id}`]),
		);
	}

	onEditFaculty(faculty: Faculty): void {
		this.selectedFaculty = faculty;
		this.facultyEditForm.patchValue({
			nameTh: faculty.name_th,
			nameEn: faculty.name_en,
		});
		this.editFacultyModal.show();
	}
	onConfirmEdit(): void {
		if (this.selectedFaculty) {
			const updatedFaculty = {
				...this.selectedFaculty,
				name_th: this.facultyEditForm.value.nameTh,
				name_en: this.facultyEditForm.value.nameEn,
			};
			this.updateFaculty(updatedFaculty);
		}
	}
	updateFaculty(faculty: Faculty): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/update`;

		this.loadingService.show(() => {
			this.http
				.patch(apiUrl, faculty)
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

	onCreateFaculty(): void {
		this.facultyCreateForm.patchValue({
			nameTh: '',
			nameEn: '',
		});
		this.createFacultyModal.show();
	}
	onConfirmCreate(): void {
		const createdFaculty = {
			id: -1,
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
}
