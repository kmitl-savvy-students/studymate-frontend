import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Department } from '@models/Department';
import { Program } from '@models/Program.model';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-program',
	standalone: true,
	imports: [SDMBaseButton, CommonModule, SDMBaseModal, ReactiveFormsModule],
	templateUrl: 'program.page.html',
})
export class SDMPageProgram implements OnInit {
	departmentId: number | null = null;
	department: Department | null = null;

	programs: Program[] = [];
	isLoading = false;
	selectedProgram: Program | null = null;
	programCreateForm: FormGroup;
	programEditForm: FormGroup;

	@ViewChild('createProgramModal') createProgramModal!: SDMBaseModal;
	@ViewChild('editProgramModal') editProgramModal!: SDMBaseModal;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private router: Router,
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private loadingService: LoadingService,
		private alertService: AlertService,
	) {
		this.programCreateForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
		this.programEditForm = this.fb.group({
			nameTh: [''],
			nameEn: [''],
		});
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const id = params.get('departmentId');
			if (id) {
				this.departmentId = +id;
				this.fetchPrograms();
			}
		});
	}

	// #region Fetchings
	fetchPrograms(): void {
		if (!this.departmentId) return;
		this.isLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/program/get-by-department/${this.departmentId}`;

		this.loadingService.show(() => {
			this.http
				.get<Program[]>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.programs = data;
						this.isLoading = false;

						if (this.programs.length != 0) {
							this.department = this.programs[0].department;
						} else {
							this.fetchDepartment();
						}
					},
					error: (error) => {
						console.error('Error fetching program:', error);
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
	onCreateProgram(): void {
		this.programCreateForm.patchValue({
			nameTh: '',
			nameEn: '',
		});
		this.createProgramModal.show();
	}
	onConfirmCreate(): void {
		if (this.programCreateForm.value.nameTh.trim().length == 0 || this.programCreateForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อแผนการเรียน');
			return;
		}
		this.createProgramModal.hide();

		const createdProgram = {
			id: -1,
			department: this.department,
			name_th: this.programCreateForm.value.nameTh,
			name_en: this.programCreateForm.value.nameEn,
		};
		this.createProgram(createdProgram);
	}
	createProgram(program: Program): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/program/create`;

		this.loadingService.show(() => {
			this.http
				.post(apiUrl, program)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchPrograms();
					},
					error: (error) => {
						console.error('Error creating program:', error);
					},
				});
		});
	}
	// #endregion
	// #region Edit
	onEditProgram(program: Program): void {
		this.selectedProgram = program;
		this.programEditForm.patchValue({
			nameTh: program.name_th,
			nameEn: program.name_en,
		});
		this.editProgramModal.show();
	}
	onConfirmEdit(): void {
		if (this.programEditForm.value.nameTh.trim().length == 0 || this.programEditForm.value.nameEn.trim().length == 0) {
			this.alertService.showAlert('error', 'กรุณากรอกชื่อแผนการเรียน');
			return;
		}
		this.editProgramModal.hide();

		if (this.selectedProgram) {
			const updatedProgram = {
				...this.selectedProgram,
				name_th: this.programEditForm.value.nameTh,
				name_en: this.programEditForm.value.nameEn,
			};
			this.updateProgram(updatedProgram);
		}
	}
	updateProgram(program: Program): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/program/update`;

		this.loadingService.show(() => {
			this.http
				.put(apiUrl, program)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.fetchPrograms();
					},
					error: (error) => {
						console.error('Error updating program:', error);
					},
				});
		});
	}
	// #endregion
}
