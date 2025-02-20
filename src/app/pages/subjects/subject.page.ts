import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { SDMilterBarComponent } from '@components/filter-bar/filter-bar.component';
import { SDMSearchBarComponent } from '@components/search-bar/search-bar.component';
import { SDMSelectComponent } from '@components/select/select.component';
import { Curriculum } from '@models/Curriculum.model';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { Program } from '@models/Program.model';
import { SelectedData } from '@models/SdmAppService.model';
import { SubjectCardData } from '@models/SubjectCardData.model';
import { User } from '@models/User.model';
import { APIManagementService } from '@services/api-management.service';
import { initFlowbite } from 'flowbite';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, switchMap, tap } from 'rxjs/operators';
import { SDMBaseAccordion } from '../../components/accordion/base-accordion.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { classYearList, semesterList, subjects_added, yearsList } from './subject-page-data';

@Component({
	selector: 'sdm-page-subject',
	standalone: true,
	imports: [SDMSelectComponent, SDMSearchBarComponent, CommonModule, SDMilterBarComponent, SDMPaginationComponent, SDMSubjectComponent, SDMBaseAccordion],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMPageSubject implements AfterViewInit, OnInit {
	@ViewChildren(SDMSelectComponent) dropdowns!: QueryList<SDMSelectComponent>;
	@ViewChild(SDMSearchBarComponent) sdmSearchBar!: SDMSearchBarComponent;

	public currentPage: number = 1;
	public itemsPerPage: number = 10;
	public paginatedItems: SubjectCardData[] = [];
	public subjectCardTotal: number = 0;

	public selectedYear: number = -1;
	public selectedSemester: number = -1;
	public selectedClassYear: string = '';
	public selectedFaculty: number = -1;
	public selectedProgram: number = -1;
	public selectedDepartment: number = -1;
	public selectedCurriculum: number = -1;

	public selectedData?: SelectedData;

	public currentRoute: string = '';
	public user: User | null = null;
	public isNavigating: boolean = false;

	public yearsList = yearsList;
	public semesterList = semesterList;
	public classYearList = classYearList;
	public facultyList: Faculty[] = [];
	public departmentList: Department[] = [];
	public programList: Program[] = [];
	public curriculumList: Curriculum[] = [];

	public subjectCardData: SubjectCardData[] = [];
	public subjects_added = subjects_added;

	public filteredSubjectCardDataList: SubjectCardData[] = [];

	public isSearched: boolean = false;
	public isLoading: boolean = false;
	public isError: boolean = false;
	public isSelectAllDropdown: boolean = false;
	public isGened: boolean = false;
	public isSignIn: boolean = false;
	public getSubjectDataIsNull: boolean = false;
	public searchSubjectDataIsNull: boolean = false;

	public disableDepartmentSelectDropdown: boolean = false;
	public disableProgramSelectDropdown: boolean = false;
	public disableCurriculumSelectDropdown: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private route: ActivatedRoute,
	) {}

	ngOnInit(): void {
		this.route.params
			.pipe(
				switchMap((params) => {
					if (Object.keys(params).length > 0) {
						this.selectedYear = +params['year'];
						this.selectedSemester = +params['semester'];
						this.selectedClassYear = params['classYear'];
						this.selectedFaculty = +params['faculty'];
						this.selectedDepartment = +params['department'];
						this.selectedProgram = +params['program'];
						this.selectedCurriculum = +params['curriculum'];
					}

					if (
						this.selectedYear !== -1 &&
						this.selectedYear !== undefined &&
						this.selectedSemester !== -1 &&
						this.selectedSemester !== undefined &&
						this.selectedClassYear !== '' &&
						this.selectedClassYear !== undefined &&
						this.selectedFaculty === 0 &&
						isNaN(this.selectedDepartment) &&
						isNaN(this.selectedProgram) &&
						this.selectedCurriculum === 0
					) {
						this.isGened = true;
						console.log('isGenEd : ', this.isGened);
					} else if (
						this.selectedYear !== -1 &&
						this.selectedYear !== undefined &&
						this.selectedSemester !== -1 &&
						this.selectedSemester !== undefined &&
						this.selectedClassYear !== '' &&
						this.selectedClassYear !== undefined &&
						this.selectedFaculty !== -1 &&
						this.selectedFaculty !== 0 &&
						this.selectedFaculty !== undefined &&
						this.selectedDepartment !== -1 &&
						this.selectedDepartment !== undefined &&
						this.selectedProgram !== -1 &&
						this.selectedProgram !== undefined &&
						this.selectedCurriculum !== -1 &&
						this.selectedCurriculum !== undefined
					) {
						this.isGened = false;
						console.log('isGenEd : ', this.isGened);
					}

					if (!this.isGened) {
						return this.getDropdownFacultyAsObservable().pipe(
							concatMap(() => {
								if (this.selectedFaculty !== -1 && this.selectedFaculty !== undefined) {
									return this.getDropdownDepartmentsAsObservable(this.selectedFaculty);
								}
								return of(null);
							}),
							concatMap(() => {
								if (this.selectedDepartment !== -1 && this.selectedDepartment !== undefined) {
									return this.getDropdownProgramsAsObservable(this.selectedDepartment);
								}
								return of(null);
							}),
							concatMap(() => {
								if (this.selectedProgram !== -1 && this.selectedProgram !== undefined) {
									return this.getDropdownCurriculumsAsObservable(this.selectedProgram);
								}
								return of(null);
							}),
						);
					} else {
						return this.getDropdownFacultyAsObservable();
					}
				}),
			)
			.subscribe(() => {
				this.updateDropdownValues();
				this.checkSelectAllDropdown();
				this.filteredSubjectCardDataList = [];
				this.isSearched = false;
				if (this.isSelectAllDropdown) {
					this.getSubjectData();
				}
			});
	}

	// ngOnInit(): void {
	// 	this.getDropdownFacultyAsObservable().subscribe();
	// 	this.route.params.subscribe((params) => {
	// 		if (Object.keys(params).length > 0) {
	// 			this.setParamsToState(params);
	// 			this.initializeDropdowns();
	// 		}
	// 	});
	// }

	// private setParamsToState(params: any) {
	// 	this.selectedYear = +params['year'];
	// 	this.selectedSemester = +params['semester'];
	// 	this.selectedClassYear = params['classYear'];
	// 	this.selectedFaculty = +params['faculty'];

	// 	// Handle GenEd case
	// 	if (this.selectedFaculty === 0) {
	// 		this.selectedCurriculum = +params['curriculum'];
	// 		this.isGened = true;
	// 	} else {
	// 		this.selectedDepartment = +params['department'];
	// 		this.selectedProgram = +params['program'];
	// 		this.selectedCurriculum = +params['curriculum'];
	// 		this.isGened = false;
	// 	}
	// }

	// private initializeDropdowns() {
	// 	if (!this.isGened && this.selectedFaculty !== -1) {
	// 		this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe(() => {
	// 			// If department is selected, get programs
	// 			if (this.selectedDepartment !== -1) {
	// 				this.getDropdownProgramsAsObservable(this.selectedDepartment).subscribe(() => {
	// 					// If program is selected, get curriculums
	// 					if (this.selectedProgram !== -1) {
	// 						this.getDropdownCurriculumsAsObservable(this.selectedProgram).subscribe(() => {
	// 							this.updateDropdownValues();
	// 							this.checkSelectAllDropdown();
	// 							if (this.isSelectAllDropdown) {
	// 								this.getSubjectData();
	// 							}
	// 						});
	// 					}
	// 				});
	// 			}
	// 		});
	// 	} else {
	// 		this.updateDropdownValues();
	// 		this.checkSelectAllDropdown();
	// 		if (this.isSelectAllDropdown) {
	// 			this.getSubjectData();
	// 		}
	// 	}
	// }

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public updateDropdownValues() {
		this.dropdowns.forEach((dropdown) => {
			switch (dropdown.SelectName) {
				case 'selectedYear': {
					const option = this.yearsList.find((option) => option.value === this.selectedYear);
					if (option) {
						dropdown.onSelectedOption(option.value, option.label);
					}
					break;
				}
				case 'selectedSemester': {
					const option = this.semesterList.find((option) => option.value === this.selectedSemester);
					if (option) {
						dropdown.onSelectedOption(option.value, option.label);
					}
					break;
				}
				case 'selectedClassYear': {
					const option = this.classYearList.find((option) => option.value.toString() === this.selectedClassYear);
					if (option) {
						dropdown.onSelectedOption(option.value, option.label);
					}
					break;
				}
				case 'selectedFaculty': {
					const option = this.facultyList.find((option) => option.id === this.selectedFaculty);
					if (option) {
						dropdown.onSelectedOption(option.id, option.name_th);
					}
					break;
				}
				case 'selectedDepartment': {
					const option = this.departmentList.find((option) => option.id === this.selectedDepartment);
					if (option) {
						dropdown.onSelectedOption(option.id, option.name_th);
					}
					break;
				}
				case 'selectedProgram': {
					const option = this.programList.find((option) => option.id === this.selectedProgram);
					if (option) {
						dropdown.onSelectedOption(option.id, option.name_th);
					}
					break;
				}
				case 'selectedCurriculum': {
					const option = this.curriculumList.find((option) => option.id === this.selectedCurriculum);
					if (option) {
						dropdown.onSelectedOption(option.id, option.name_th);
					}
					break;
				}
				default:
					break;
			}
		});
	}

	public updatePaginatedItems() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		const dataToPaginate = this.isSearched ? this.filteredSubjectCardDataList : this.subjectCardData;
		this.paginatedItems = dataToPaginate.slice(start, end);
		this.subjectCardTotal = dataToPaginate.length;
	}

	public changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	public getSubjectData() {
		this.isLoading = true;
		this.isError = false;

		this.apiManagementService.GetSubjectsDataInSubjectPage(this.selectedYear - 543, this.selectedSemester, this.selectedClassYear, this.selectedCurriculum).subscribe({
			next: (res) => {
				if (res && res.length > 0) {
					this.subjectCardData = res;
					this.subjectCardTotal = this.subjectCardData.length;
					this.updatePaginatedItems();
				} else {
					console.log('No Subject Data Available.');
					this.subjectCardData = [];
					this.getSubjectDataIsNull = true;
				}
				this.isLoading = false;
				this.currentPage = 1;
			},
			error: (error) => {
				if (error.status === 400) {
					console.error('400');
				} else if (error.status === 404) {
					console.error('Not found');
				} else if (error.status === 500) {
					console.error('Internal Server Error');
				} else {
					console.error('An unexpected error occurred:', error.status);
				}
				this.isError = true;
				this.isLoading = false;
			},
		});
	}

	public getDropdownFacultyAsObservable(): Observable<Faculty[]> {
		return this.apiManagementService.GetDropdownFaculties().pipe(
			tap((res) => {
				if (res) {
					this.facultyList = res;
					console.log('fetching facultyList : ', this.facultyList);
				}
			}),
			catchError((error) => {
				console.error('Error fetching facultyList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownDepartmentsAsObservable(selectedFaculty: number): Observable<Department[]> {
		if (selectedFaculty === 0) {
			return of([]);
		}

		return this.apiManagementService.GetDropdownDepartments(selectedFaculty).pipe(
			tap((res) => {
				this.departmentList = res?.length > 0 ? res : [{ id: -1, kmitl_id: '-1', faculty: null, name_th: 'ไม่พบข้อมูลภาควิชา', name_en: 'No Department Data' }];
			}),
			catchError((error) => {
				console.error('Error fetching departmentList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownProgramsAsObservable(selectedDepartment: number): Observable<Program[]> {
		if (this.isGened) {
			return of([]);
		}

		return this.apiManagementService.GetDropdownPrograms(selectedDepartment).pipe(
			tap((res) => {
				this.programList = res?.length > 0 ? res : [{ id: -1, kmitl_id: '-1', department: null, name_th: 'ไม่พบข้อมูลแผนการเรียน', name_en: 'No Program Data' }];
			}),
			catchError((error) => {
				console.error('Error fetching programList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownCurriculumsAsObservable(selectedProgram: number): Observable<Curriculum[]> {
		if (this.isGened) {
			return of([]);
		}

		return this.apiManagementService.GetDropdownCurriculums(selectedProgram).pipe(
			tap((res) => {
				this.curriculumList =
					res?.length > 0
						? res.map((curriculum) => ({
								...curriculum,
								name_th: `${curriculum.name_th} (${curriculum.year})`,
								name_en: `${curriculum.name_en} (${curriculum.year})`,
							}))
						: [{ id: -1, program: null, year: -1, name_th: 'ไม่พบข้อมูลหลักสูตร', name_en: 'No Curriculum Data', curriculum_group: null }];
			}),
			catchError((error) => {
				console.error('Error fetching curriculumList:', error);
				return EMPTY;
			}),
		);
	}

	public handleSelectChange(selectName: string, selectedData: SelectedData) {
		this.subjectCardData = [];
		this.getSubjectDataIsNull = false;
		this.isSearched = false;

		switch (selectName) {
			case 'selectedYear':
				this.selectedYear = selectedData.value;
				console.log('selectedYear :', this.selectedYear);
				break;
			case 'selectedSemester':
				this.selectedSemester = selectedData.value;
				console.log('selectedSemester :', this.selectedSemester);
				break;
			case 'selectedClassYear':
				this.selectedClassYear = selectedData.value.toString();
				console.log('selectedClassYear :', this.selectedClassYear);
				break;
			case 'selectedFaculty':
				const oldSelectFaculty = this.selectedFaculty;
				this.selectedFaculty = selectedData.value;
				this.isGened = this.selectedFaculty === 0;

				if (this.selectedFaculty === undefined || this.selectedFaculty === -1 || (oldSelectFaculty !== this.selectedFaculty && oldSelectFaculty !== -1)) {
					this.resetDependentDropdowns('faculty');
				}

				if (this.selectedFaculty !== -1 && !this.isGened) {
					this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe();
				}
				console.log('selectedFaculty :', this.selectedFaculty);
				break;
			case 'selectedDepartment':
				const oldSelectedDepartment = this.selectedDepartment;
				this.selectedDepartment = selectedData.value;

				if (this.selectedDepartment === undefined || this.selectedDepartment === -1 || (oldSelectedDepartment !== this.selectedDepartment && oldSelectedDepartment !== -1)) {
					this.resetDependentDropdowns('department');
				}

				if (this.selectedDepartment !== -1) {
					this.getDropdownProgramsAsObservable(this.selectedDepartment).subscribe();
				}
				console.log('selectedDepartment :', this.selectedDepartment);
				break;
				break;
			case 'selectedProgram':
				const oldSelectedProgram = this.selectedProgram;
				this.selectedProgram = selectedData.value;

				if (this.selectedProgram === undefined || this.selectedProgram === -1 || (oldSelectedProgram !== this.selectedProgram && oldSelectedProgram !== -1)) {
					this.resetDependentDropdowns('program');
				}

				if (this.selectedProgram !== -1) {
					this.getDropdownCurriculumsAsObservable(this.selectedProgram).subscribe();
				}
				console.log('selectedProgram :', this.selectedProgram);
				break;
			case 'selectedCurriculum':
				this.selectedCurriculum = selectedData.value;
				console.log('selectedCurriculum :', this.selectedCurriculum);
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}
		console.log('selectedCurriculum ; ', this.selectedCurriculum);
		this.clearSearch();
		this.checkSelectAllDropdown();
		console.log('this.isSelectAllDropdown ; ', this.isSelectAllDropdown);
		if (this.isSelectAllDropdown) {
			this.navigateToSubject();
		}
	}

	private resetDependentDropdowns(level: 'faculty' | 'department' | 'program') {
		switch (level) {
			case 'faculty':
				this.resetDropdowns('selectedDepartment');
				this.resetDropdowns('selectedProgram');
				this.resetDropdowns('selectedCurriculum');
				break;
			case 'department':
				this.resetDropdowns('selectedProgram');
				this.resetDropdowns('selectedCurriculum');
				break;
			case 'program':
				this.resetDropdowns('selectedCurriculum');
				break;
		}
	}

	// private handleFacultyChange(value: number) {
	// 	const oldSelectFaculty = this.selectedFaculty;
	// 	this.selectedFaculty = value;
	// 	this.isGened = this.selectedFaculty === 0;

	// 	if (this.selectedFaculty === undefined || this.selectedFaculty === -1 || (oldSelectFaculty !== this.selectedFaculty && oldSelectFaculty !== -1)) {
	// 		this.resetDependentDropdowns('faculty');
	// 	}

	// 	if (this.selectedFaculty !== -1 && !this.isGened) {
	// 		this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe();
	// 	}
	// }

	// private handleDepartmentChange(value: number) {
	// 	const oldSelectedDepartment = this.selectedDepartment;
	// 	this.selectedDepartment = value;

	// 	if (this.selectedDepartment === undefined || this.selectedDepartment === -1 || (oldSelectedDepartment !== this.selectedDepartment && oldSelectedDepartment !== -1)) {
	// 		this.resetDependentDropdowns('department');
	// 	}

	// 	if (this.selectedDepartment !== -1) {
	// 		this.getDropdownProgramsAsObservable(this.selectedDepartment).subscribe();
	// 	}
	// }

	// private handleProgramChange(value: number) {
	// 	const oldSelectedProgram = this.selectedProgram;
	// 	this.selectedProgram = value;

	// 	if (this.selectedProgram === undefined || this.selectedProgram === -1 || (oldSelectedProgram !== this.selectedProgram && oldSelectedProgram !== -1)) {
	// 		this.resetDependentDropdowns('program');
	// 	}

	// 	if (this.selectedProgram !== -1) {
	// 		this.getDropdownCurriculumsAsObservable(this.selectedProgram).subscribe();
	// 	}
	// }

	// private handleBasicSelectChange(selectName: string, value: any) {
	// 	switch (selectName) {
	// 		case 'selectedYear':
	// 			this.selectedYear = value;
	// 			break;
	// 		case 'selectedSemester':
	// 			this.selectedSemester = value;
	// 			break;
	// 		case 'selectedClassYear':
	// 			this.selectedClassYear = value.toString();
	// 			break;
	// 		case 'selectedCurriculum':
	// 			this.selectedCurriculum = value;
	// 			break;
	// 	}
	// }

	private clearSearch() {
		if (this.sdmSearchBar) {
			this.sdmSearchBar.clearSearch();
			this.isSearched = false;
		}
	}

	public checkSelectAllDropdown() {
		console.log('isGenEd from selectAllDrpdown : ', this.isGened);

		if (
			this.selectedYear !== -1 &&
			this.selectedYear !== undefined &&
			this.selectedSemester !== -1 &&
			this.selectedSemester !== undefined &&
			this.selectedClassYear !== '' &&
			this.selectedClassYear !== undefined &&
			this.selectedFaculty === 0 &&
			(this.selectedDepartment === -1 || this.selectedDepartment === undefined || isNaN(this.selectedDepartment)) &&
			(this.selectedProgram === -1 || this.selectedProgram === undefined || isNaN(this.selectedProgram)) &&
			(this.selectedCurriculum === -1 || this.selectedCurriculum === undefined)
		) {
			this.isSelectAllDropdown = true;
			this.selectedCurriculum = 0;
			// this.isGened = true;
		} else if (
			this.selectedYear !== -1 &&
			this.selectedYear !== undefined &&
			this.selectedSemester !== -1 &&
			this.selectedSemester !== undefined &&
			this.selectedClassYear !== '' &&
			this.selectedClassYear !== undefined &&
			this.selectedFaculty !== -1 &&
			this.selectedFaculty !== 0 &&
			this.selectedFaculty !== undefined &&
			this.selectedDepartment !== -1 &&
			this.selectedDepartment !== undefined &&
			this.selectedProgram !== -1 &&
			this.selectedProgram !== undefined &&
			this.selectedCurriculum !== -1 &&
			this.selectedCurriculum !== undefined
		) {
			this.isSelectAllDropdown = true;
		} else {
			this.isSelectAllDropdown = false;
		}
		this.checkDisableSelectDropdown();
	}

	public resetDropdowns(selectName?: string) {
		this.dropdowns.forEach((dropdown) => {
			if (dropdown.SelectName === selectName) {
				dropdown.onSelectedOption(-1, '');
			}
		});
	}

	public checkDisableSelectDropdown() {
		// if (this.selectedFaculty === 90 || this.selectedDepartment === 90 || this.isGened || this.selectedFaculty === -1 || this.selectedFaculty === undefined || this.selectedDepartment === -1 || this.selectedDepartment === undefined) {
		// 	this.disableCurriculumSelectDropdown = true;
		// } else {
		// 	this.disableCurriculumSelectDropdown = false;
		// }

		if (this.selectedFaculty === -1 || (this.selectedFaculty === undefined && this.dropdowns)) {
			this.disableDepartmentSelectDropdown = true;
			this.disableProgramSelectDropdown = true;
			this.disableCurriculumSelectDropdown = true;
		} else if (this.selectedDepartment === -1 || (this.selectedDepartment === undefined && this.dropdowns)) {
			this.disableDepartmentSelectDropdown = false;
			this.disableProgramSelectDropdown = true;
			this.disableCurriculumSelectDropdown = true;
		} else if (this.selectedProgram === -1 || (this.selectedProgram === undefined && this.dropdowns)) {
			this.disableDepartmentSelectDropdown = false;
			this.disableProgramSelectDropdown = false;
			this.disableCurriculumSelectDropdown = true;
		} else {
			this.disableDepartmentSelectDropdown = false;
			this.disableProgramSelectDropdown = false;
			this.disableCurriculumSelectDropdown = false;
		}
	}

	public urlSegments: any;

	public navigateToSubject() {
		let latestSubjectUrl: string;

		// if (
		// 	this.isSelectAllDropdown &&
		// 	this.selectedFaculty !== 0 &&
		// 	this.selectedFaculty !== -1 &&
		// 	this.selectedFaculty !== undefined &&
		// 	this.selectedDepartment !== -1 &&
		// 	this.selectedDepartment !== undefined &&
		// 	this.selectedProgram !== -1 &&
		// 	this.selectedProgram !== undefined &&
		// 	this.selectedCurriculum !== -1 &&
		// 	this.selectedCurriculum !== undefined
		// ) {
		// 	const urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedDepartment, this.selectedProgram, this.selectedCurriculum];
		// 	console.log('111111111111111111111111111111111111111111');
		// 	// สร้าง URL tree แยกจาก string
		// 	const urlTree = this.router.createUrlTree(urlSegments);
		// 	latestSubjectUrl = urlTree.toString();

		// 	// กำหนด navigation options
		// 	const navigationExtras: NavigationExtras = {
		// 		skipLocationChange: false,
		// 		replaceUrl: true,
		// 	};

		// 	// ใช้ navigate พร้อมกับ options
		// 	this.router
		// 		.navigate([latestSubjectUrl], navigationExtras)
		// 		.then((success) => {
		// 			if (success) {
		// 				console.log('Navigation successful!');
		// 				if (this.isSelectAllDropdown) {
		// 					this.getSubjectData();
		// 				}
		// 			} else {
		// 				console.error('Navigation failed.');
		// 			}
		// 		})
		// 		.catch((error) => {
		// 			console.error('Navigation error:', error);
		// 		});
		// }

		if (!this.isGened) {
			this.urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedDepartment, this.selectedProgram, this.selectedCurriculum];
			// console.log('path วิดวะ');
		} else if (this.isGened) {
			this.urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedCurriculum];
			// console.log('path gened');
		}

		// console.log('urlSegment : ', this.urlSegments);
		if (this.urlSegments) {
			const urlTree = this.router.createUrlTree(this.urlSegments);
			latestSubjectUrl = urlTree.toString();
			// console.log('latestSubjectUrl : ', latestSubjectUrl);

			// กำหนด navigation options
			const navigationExtras: NavigationExtras = {
				skipLocationChange: false,
				replaceUrl: true,
			};

			// ใช้ navigate พร้อมกับ options
			this.router
				.navigate([latestSubjectUrl], navigationExtras)
				.then((success) => {
					if (success) {
						console.log('Navigation successful!');
						if (this.isSelectAllDropdown) {
							this.getSubjectData();
						}
					} else {
						// console.error('Navigation failed.');
					}
				})
				.catch((error) => {
					console.error('Navigation error:', error);
				});
		}
	}

	public getSearchedSubjectCardDataList(filteredSubjectCardDataList: SubjectCardData[]) {
		this.filteredSubjectCardDataList = filteredSubjectCardDataList;
		this.searchSubjectDataIsNull = this.filteredSubjectCardDataList.length === 0;
		this.isSearched = true;
		this.currentPage = 1;
		this.updatePaginatedItems();
	}

	public searchFunction(data: SubjectCardData[], searchValue: string): SubjectCardData[] {
		return data.filter((subject) => subject?.subject?.id?.toLowerCase().includes(searchValue.toLowerCase()) || subject?.subject?.name_en?.toLowerCase().includes(searchValue.toLowerCase()));
	}
}
