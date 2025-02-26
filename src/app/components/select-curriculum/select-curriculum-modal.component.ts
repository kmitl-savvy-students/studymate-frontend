import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Curriculum } from '@models/Curriculum.model';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { Program } from '@models/Program.model';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { User } from '../../shared/models/User.model';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { BackendService } from '../../shared/services/backend.service';
import { SDMBaseButton } from '../buttons/base-button.component';

@Component({
	selector: 'modal-select-curriculum',
	standalone: true,
	templateUrl: 'select-curriculum-modal.html',
	imports: [SDMBaseButton, ReactiveFormsModule, CommonModule],
})
export class SelectCurriculumModalComponent implements OnInit {
	modal: ModalInterface | undefined;
	currentUser: User | null = null;

	constructor(
		private fb: FormBuilder,
		private authService: AuthenticationService,
		private http: HttpClient,
		private alertService: AlertService,
		private backendService: BackendService,
	) {
		this.dropdownForm = this.fb.group({
			faculty: [''],
			department: [''],
			program: [''],
			curriculum: [''],
		});
	}

	dropdownForm: FormGroup;

	faculties: Faculty[] = [];
	departments: Department[] = [];
	programs: Program[] = [];
	curriculums: Curriculum[] = [];

	ngOnInit(): void {
		const $modal = document.getElementById('curriculumModal');
		const options: ModalOptions = {
			backdrop: 'static',
			closable: false,
		};
		this.modal = new Modal($modal, options);

		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			this.handleModalVisibility();
		});

		this.fetchDropdownFaculties();

		this.dropdownForm.get('faculty')?.valueChanges.subscribe((facultyId) => {
			this.dropdownForm.patchValue(
				{
					department: '',
					program: '',
					curriculum: '',
				},
				{ emitEvent: false },
			);
			this.departments = [];
			this.programs = [];
			this.curriculums = [];
			if (facultyId) this.fetchDropdownDepartments(facultyId);
		});
		this.dropdownForm.get('department')?.valueChanges.subscribe((departmentId) => {
			this.dropdownForm.patchValue(
				{
					program: '',
					curriculum: '',
				},
				{ emitEvent: false },
			);
			this.programs = [];
			this.curriculums = [];
			if (departmentId) this.fetchDropdownPrograms(departmentId);
		});
		this.dropdownForm.get('program')?.valueChanges.subscribe((programId) => {
			this.dropdownForm.patchValue(
				{
					curriculum: '',
				},
				{ emitEvent: false },
			);
			this.curriculums = [];
			if (programId) this.fetchDropdownCurriculums(programId);
		});
	}

	handleModalVisibility() {
		if (this.currentUser == null) {
			return;
		}
		if (this.currentUser.curriculum == null) {
			this.modal?.show();
		}
	}

	fetchDropdownFaculties() {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/faculty/get`;

		this.http.get<Faculty[]>(apiUrl).subscribe({
			next: (data) => {
				this.faculties = data;
			},
			error: (error) => {
				console.error('Error fetching faculties:', error);
			},
		});
	}
	fetchDropdownDepartments(facultyId: number) {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/department/get-by-faculty/${facultyId}`;

		this.http.get<Department[]>(apiUrl).subscribe({
			next: (data) => {
				this.departments = data;
			},
			error: (error) => {
				console.error('Error fetching departments:', error);
			},
		});
	}
	fetchDropdownPrograms(departmentId: number) {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/program/get-by-department/${departmentId}`;

		this.http.get<Program[]>(apiUrl).subscribe({
			next: (data) => {
				this.programs = data;
			},
			error: (error) => {
				console.error('Error fetching programs:', error);
			},
		});
	}
	fetchDropdownCurriculums(programId: number) {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/get-by-program/${programId}`;

		this.http.get<Curriculum[]>(apiUrl).subscribe({
			next: (data) => {
				this.curriculums = data;
			},
			error: (error) => {
				console.error('Error fetching curriculums:', error);
			},
		});
	}

	selectCurriculum(): void {
		if (this.dropdownForm.value.curriculum.length === 0) {
			this.alertService.showAlert('error', 'กรุณาเลือกหลักสูตรก่อน');
			return;
		}

		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update/curriculum`;
		const body = {
			id: this.currentUser?.id,
			curriculum_id: this.dropdownForm.value.curriculum,
		};

		this.http.put(apiUrl, body).subscribe({
			next: () => {
				this.alertService.showAlert('success', 'เลือกหลักสูตรสำเร็จ!');
				location.reload();
			},
			error: (error) => {
				console.error('Error updating curriculum:', error);
				this.alertService.showAlert('error', 'ไม่สามารถเลือกหลักสูตรได้ กรุณาลองอีกครั้ง');
			},
		});
	}
}
