import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
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
export class SDMPageSubject implements AfterViewInit, OnInit, OnChanges {
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
	public selectedProgramKmitlId: number = -1;
	public selectedDepartment: number = -1;
	public selectedCurriculum?: string = '';

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

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']) {
			console.log('Loading:', changes['isLoading'].currentValue);
		}
	}

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
						this.selectedCurriculum = params['curriculum'];
						console.log('=========================================================');
						console.log('selectedYear :', this.selectedYear);
						console.log('selectedSemester :', this.selectedSemester);
						console.log('selectedClassYear :', this.selectedClassYear);
						console.log('selectedFaculty :', this.selectedFaculty);
						console.log('selectedDepartment :', this.selectedDepartment);
						console.log('selectedProgram :', this.selectedProgram);
						console.log('selectedCurriculum :', this.selectedCurriculum);
						console.log('=========================================================');
					}

					// โหลด dropdown ตามลำดับ (Faculty → Department → Program → Curriculum)

					// Start with getting faculties
					return this.getDropdownFacultyAsObservable().pipe(
						// ใช้ concatMap() เพื่อให้ API แต่ละตัวทำงานทีละตัว (ไม่โหลดซ้อนกัน)

						// Chain department loading if faculty is selected
						concatMap(() => {
							if (this.selectedFaculty !== -1 && this.selectedFaculty !== undefined) {
								return this.getDropdownDepartmentsAsObservable(this.selectedFaculty);
							}
							// ถ้าไม่มีค่าที่เลือก จะ return of(null); เพื่อข้ามไปอันถัดไป
							return of(null);
						}),
						// Chain program loading if department is selected
						concatMap(() => {
							if (this.selectedDepartment !== -1 && this.selectedDepartment !== undefined) {
								return this.getDropdownProgramsAsObservable(this.selectedDepartment);
							}
							// ถ้าไม่มีค่าที่เลือก จะ return of(null); เพื่อข้ามไปอันถัดไป
							return of(null);
						}),
						// Chain curriculum loading if program is selected
						concatMap(() => {
							if (this.selectedProgram !== -1 && this.selectedProgram !== undefined) {
								return this.getDropdownCurriculumsAsObservable(this.selectedProgram);
							}
							// ถ้าไม่มีค่าที่เลือก จะ return of(null); เพื่อข้ามไปอันถัดไป
							return of(null);
						}),
					);
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
						this.selectedProgramKmitlId = Number(option.kmitl_id);
						dropdown.onSelectedOption(option.id, option.name_th);
					}
					break;
				}
				case 'selectedCurriculum': {
					const option = this.curriculumList.find((option) => option.id.toString() === this.selectedCurriculum);
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

		this.apiManagementService.GetSubjectsDataInSubjectPage(this.selectedYear - 543, this.selectedSemester, this.selectedClassYear, this.selectedProgramKmitlId).subscribe({
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
					console.log('get facultyList:', this.facultyList);
				}
			}),
			catchError((error) => {
				console.error('Error fetching facultyList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownDepartmentsAsObservable(selectedFaculty: number): Observable<Department[]> {
		return this.apiManagementService.GetDropdownDepartments(selectedFaculty).pipe(
			tap((res) => {
				if (res && res.length > 0) {
					this.departmentList = res;
					console.log('departmentList:', this.departmentList);
				} else {
					this.departmentList = [{ id: -1, kmitl_id: '-1', faculty: null, name_th: 'ไม่พบข้อมูลภาควิชา', name_en: 'No Department Data' }];
					console.log('departmentList:', this.departmentList);
				}
			}),
			catchError((error) => {
				console.error('Error fetching departmentList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownProgramsAsObservable(selectedDepartment: number): Observable<Program[]> {
		return this.apiManagementService.GetDropdownPrograms(selectedDepartment).pipe(
			tap((res) => {
				if (res && res.length > 0) {
					this.programList = res;
					console.log('programList:', this.programList);
				} else {
					this.programList = [{ id: -1, kmitl_id: '-1', department: null, name_th: 'ไม่พบข้อมูลแผนการเรียน', name_en: 'No Program Data' }];
					console.log('programList:', this.programList);
				}
			}),
			catchError((error) => {
				console.error('Error fetching programList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownCurriculumsAsObservable(selectedProgram: number): Observable<Curriculum[]> {
		return this.apiManagementService.GetDropdownCurriculums(selectedProgram).pipe(
			tap((res) => {
				if (res && res.length > 0) {
					this.curriculumList = res.map((curriculum) => ({
						...curriculum,
						name_th: `${curriculum.name_th} (${curriculum.year})`,
						name_en: `${curriculum.name_en} (${curriculum.year})`,
					}));
					console.log('curriculumList:', this.curriculumList);
				} else {
					this.curriculumList = [{ id: -1, program: null, year: -1, name_th: 'ไม่พบข้อมูลหลักสูตร', name_en: 'No Curriculum Data', curriculum_group: null }];
					console.log('programList:', this.programList);
				}
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
				break;
			case 'selectedSemester':
				this.selectedSemester = selectedData.value;
				break;
			case 'selectedClassYear':
				this.selectedClassYear = selectedData.value.toString();
				break;
			case 'selectedFaculty':
				const oldSelectFacutly = this.selectedFaculty;
				this.selectedFaculty = selectedData.value;

				if (this.selectedFaculty === undefined || this.selectedFaculty === -1) {
					this.resetDropdowns('selectedDepartment');
					this.resetDropdowns('selectedProgram');
					this.resetDropdowns('selectedCurriculum');
				} else if (oldSelectFacutly !== this.selectedFaculty && oldSelectFacutly !== -1 && this.selectedFaculty !== undefined && this.selectedFaculty !== -1) {
					this.resetDropdowns('selectedDepartment');
					this.resetDropdowns('selectedProgram');
					this.resetDropdowns('selectedCurriculum');
					this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe();
				} else {
					this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe();
				}
				break;
			case 'selectedDepartment':
				const oldSelectedDepartment = this.selectedDepartment;
				this.selectedDepartment = selectedData.value;

				if (this.selectedDepartment === undefined || this.selectedDepartment === -1) {
					this.resetDropdowns('selectedProgram');
					this.resetDropdowns('selectedCurriculum');
				} else if (oldSelectedDepartment !== this.selectedDepartment && oldSelectedDepartment !== -1 && this.selectedDepartment !== undefined && this.selectedDepartment !== -1) {
					this.resetDropdowns('selectedProgram');
					this.resetDropdowns('selectedCurriculum');
					this.getDropdownProgramsAsObservable(this.selectedDepartment).subscribe();
				} else {
					this.getDropdownProgramsAsObservable(this.selectedDepartment).subscribe();
				}
				break;
			case 'selectedProgram':
				const oldSelectedProgram = this.selectedProgram;
				this.selectedProgram = selectedData.value;

				if (this.selectedProgram === undefined || this.selectedProgram === -1) {
					this.resetDropdowns('selectedCurriculum');
				} else if (oldSelectedProgram !== this.selectedProgram && oldSelectedProgram !== -1 && this.selectedProgram !== undefined && this.selectedProgram !== -1) {
					this.resetDropdowns('selectedCurriculum');
					this.getDropdownCurriculumsAsObservable(this.selectedProgram).subscribe();
				} else {
					this.getDropdownCurriculumsAsObservable(this.selectedProgram).subscribe();
				}
				break;
			case 'selectedCurriculum':
				this.selectedCurriculum = selectedData.value.toString();
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}
		this.checkSelectAllDropdown();
		if (this.isSelectAllDropdown) {
			setTimeout(() => {
				this.navigateToSubject();
			});
		} else {
			this.clearSearch();
		}
	}

	private clearSearch() {
		if (this.sdmSearchBar) {
			this.sdmSearchBar.clearSearch();
		}
	}

	public checkSelectAllDropdown() {
		if (this.selectedFaculty === 90 && this.selectedDepartment === 90) {
			if (
				this.selectedYear !== 0 &&
				this.selectedYear !== undefined &&
				this.selectedSemester !== 0 &&
				this.selectedSemester !== undefined &&
				this.selectedClassYear !== '' &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty === 90 &&
				this.selectedDepartment === 90
			) {
				this.selectedCurriculum = 'x';
				this.isSelectAllDropdown = true;
			} else {
				this.isSelectAllDropdown = false;
			}
		} else {
			this.isGened = false;
			if (
				this.selectedYear !== -1 &&
				this.selectedYear !== undefined &&
				this.selectedSemester !== -1 &&
				this.selectedSemester !== undefined &&
				this.selectedClassYear !== '' &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty !== -1 &&
				this.selectedFaculty !== 90 &&
				this.selectedFaculty !== undefined &&
				this.selectedDepartment !== -1 &&
				this.selectedDepartment !== 90 &&
				this.selectedDepartment !== undefined &&
				this.selectedCurriculum !== '' &&
				this.selectedCurriculum !== '-1' &&
				this.selectedCurriculum !== 'x' &&
				this.selectedCurriculum !== undefined
			) {
				this.isSelectAllDropdown = true;
			} else {
				this.isSelectAllDropdown = false;
			}
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
		if (this.selectedFaculty === 90 || this.selectedDepartment === 90 || this.isGened || this.selectedFaculty === -1 || this.selectedFaculty === undefined || this.selectedDepartment === -1 || this.selectedDepartment === undefined) {
			this.disableCurriculumSelectDropdown = true;
		} else {
			this.disableCurriculumSelectDropdown = false;
		}

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

	public navigateToSubject() {
		let latestSubjectUrl: string;

		if (
			this.isSelectAllDropdown &&
			this.selectedFaculty !== -1 &&
			this.selectedFaculty !== 90 &&
			this.selectedFaculty !== undefined &&
			this.selectedDepartment !== -1 &&
			this.selectedDepartment !== 90 &&
			this.selectedDepartment !== undefined &&
			this.selectedProgram !== -1 &&
			this.selectedProgram !== undefined &&
			this.selectedCurriculum !== '' &&
			this.selectedCurriculum !== 'x' &&
			this.selectedCurriculum !== undefined
		) {
			const urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedDepartment, this.selectedProgram, this.selectedCurriculum];

			// สร้าง URL tree แยกจาก string
			const urlTree = this.router.createUrlTree(urlSegments);
			latestSubjectUrl = urlTree.toString();

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
						const option = this.programList.find((option) => option.id === this.selectedProgram);
						if (option) {
							this.selectedProgramKmitlId = Number(option.kmitl_id);
						}
						console.log('Navigation successful!');
						if (this.isSelectAllDropdown) {
							this.getSubjectData();
						}
					} else {
						console.error('Navigation failed.');
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
		return data.filter((subject) => subject.subject.id.toLowerCase().includes(searchValue.toLowerCase()) || subject.subject.name_en.toLowerCase().includes(searchValue.toLowerCase()));
	}
}
