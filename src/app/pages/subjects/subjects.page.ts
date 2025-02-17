import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { Program } from '@models/Program.model';
import { SubjectCard } from '@models/SubjectCard.model';
import { BackendService } from '@services/backend.service';
import { distinctUntilChanged } from 'rxjs';

@Component({
	imports: [ReactiveFormsModule, CommonModule],
	selector: 'sdm-page-subjects',
	standalone: true,
	templateUrl: 'subjects.page.html',
})
export class SDMPageSubjects implements OnInit {
	queriedSubjectCards: SubjectCard[] = [];

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
		private backendService: BackendService,
	) {
		this.searchDropdownForm = this.fb.group({
			academic_year: [''],
			academic_term: [''],
			year: [''],
			faculty: [''],
			department: [''],
			program: [''],
		});
		this.searchForm = this.fb.group({
			query: [''],
		});
	}

	oneTimeFetch: boolean = true;
	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.searchDropdownForm.patchValue(
				{
					academic_year: params['academic_year'] || '',
					academic_term: params['academic_term'] || '',
					year: params['year'] || '',
					faculty: params['faculty'] || '',
					department: params['department'] || '',
					program: params['program'] || '',
				},
				{ emitEvent: false },
			);

			if (this.oneTimeFetch) {
				this.fetchDropdownFaculties();
				if (params['faculty']) this.fetchDropdownDepartments(params['faculty']);
				if (params['department']) this.fetchDropdownPrograms(params['department']);
				this.oneTimeFetch = false;
			}

			if (this.isQueryParamsAllSet(params)) {
				this.fetchSubjects(params);
			}
		});

		this.searchDropdownForm.valueChanges.pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))).subscribe((values) => {
			this.router.navigate([], {
				queryParams: {
					academic_year: values.academic_year || undefined,
					academic_term: values.academic_term || undefined,
					year: values.year || undefined,
					faculty: values.faculty || undefined,
					department: values.department || undefined,
					program: values.program || undefined,
				},
				queryParamsHandling: 'merge',
			});
		});

		this.searchDropdownForm
			.get('faculty')
			?.valueChanges.pipe(distinctUntilChanged())
			.subscribe((facultyId) => {
				this.searchDropdownForm.patchValue(
					{
						department: '',
						program: '',
					},
					{ emitEvent: false },
				);
				this.departments = [];
				this.programs = [];
				if (facultyId) this.fetchDropdownDepartments(facultyId);
			});
		this.searchDropdownForm
			.get('department')
			?.valueChanges.pipe(distinctUntilChanged())
			.subscribe((departmentId) => {
				this.searchDropdownForm.patchValue({ program: '' }, { emitEvent: false });
				this.programs = [];
				if (departmentId) this.fetchDropdownPrograms(departmentId);
			});

		this.searchDropdownForm.valueChanges.subscribe(() => {});
	}

	fetchSubjects(params: any) {
		let payload = {
			academic_year: params.academic_year,
			academic_term: params.academic_term,
			year: params.year,
			program: params.program,
		};
		const apiUrl = `${this.backendService.getBackendUrl()}/api/subject-class/get-by-class${this.createSubjectsQueryParams(payload)}`;

		this.http.get<any>(apiUrl).subscribe({
			next: (data) => {},
			error: (error) => {
				console.error('Error fetching subject classes:', error);
			},
		});
	}

	// #region Subjects Dropdown Query
	searchDropdownForm: FormGroup;
	searchForm: FormGroup;

	faculties: Faculty[] = [];
	departments: Department[] = [];
	programs: Program[] = [];

	isQueryParamsAllSet(params: any): boolean {
		return ['academic_year', 'academic_term', 'year', 'faculty', 'department', 'program'].every((key) => params[key]);
	}
	createSubjectsQueryParams(params: any): string {
		const queryParams = Object.keys(params)
			.filter((key) => params[key] && params[key] !== '-1')
			.map((key) => `${key}=${params[key]}`)
			.join('&');
		return queryParams ? `?${queryParams}` : '';
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
	// #endregion
}
