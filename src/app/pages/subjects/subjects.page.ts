import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCard } from '@models/SubjectCard.model';

@Component({
	imports: [ReactiveFormsModule, CommonModule],
	selector: 'sdm-page-subjects',
	standalone: true,
	templateUrl: 'subjects.page.html',
})
export class SDMPageSubjects implements OnInit {
	searchDropdownForm: FormGroup;
	searchForm: FormGroup;

	queriedSubjectCards: SubjectCard[] = [];

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private http: HttpClient,
	) {
		this.searchDropdownForm = this.fb.group({
			academic_year: [''],
			academic_term: [''],
			year: [''],
			faculty: [''],
			department: [''],
			curriculum: [''],
		});
		this.searchForm = this.fb.group({
			query: [''],
		});
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			this.searchDropdownForm.patchValue({
				academic_year: params['academic_year'] || '',
				academic_term: params['academic_term'] || '',
				year: params['year'] || '',
				faculty: params['faculty'] || '',
				department: params['department'] || '',
				curriculum: params['curriculum'] || '',
			});
			if (this.isQueryParamsAllSet(params)) {
				this.fetchSubjects(params);
			}
		});
		this.searchDropdownForm.valueChanges.subscribe((values) => {
			const queryParams = {
				academic_year: values.academic_year || undefined,
				academic_term: values.academic_term || undefined,
				year: values.year || undefined,
				faculty: values.faculty || undefined,
				department: values.department || undefined,
				curriculum: values.curriculum || undefined,
			};
			this.router.navigate([], {
				queryParams: queryParams,
				queryParamsHandling: 'merge',
			});
		});
	}

	fetchSubjects(params: any) {
		console.log('fethcingsss...');
		// const url = `/subjects${this.createSubjectsQueryParams(params)}`;
		// this.http.get(url).subscribe((data) => {
		// 	console.log('Fetched Subjects:', data);
		// });
	}

	// #region Subjects Dropdown Query
	isQueryParamsAllSet(params: any): boolean {
		const isAcademicYearSet = params['academic_year'] && params['academic_year'].length !== 0;
		const isAcademicTermSet = params['academic_term'] && params['academic_term'].length !== 0;
		const isYearSet = params['year'] && params['year'].length !== 0;
		const isFacultySet = params['faculty'] && params['faculty'].length !== 0;
		const isDepartmentSet = params['department'] && params['department'].length !== 0;
		const isCurriculumSet = params['curriculum'] && params['curriculum'].length !== 0;
		return isAcademicYearSet && isAcademicTermSet && isYearSet && isFacultySet && isDepartmentSet && isCurriculumSet;
	}
	createSubjectsQueryParams(params: any): string {
		const queryParams = Object.keys(params)
			.filter((key) => params[key] && params[key] !== '-1')
			.map((key) => `${key}=${params[key]}`)
			.join('&');
		return queryParams ? `?${queryParams}` : '';
	}
	// #endregion
}
