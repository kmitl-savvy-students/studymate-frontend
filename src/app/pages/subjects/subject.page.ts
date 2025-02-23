import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { SDMfilterBarComponent } from '@components/filter-bar/filter-bar.component.js';
import { SDMSearchBarComponent } from '@components/search-bar/search-bar.component';
import { SDMSelectComponent } from '@components/select/select.component';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { Program } from '@models/Program.model';
import { SelectedData } from '@models/SdmAppService.model';
import { SubjectCardData } from '@models/SubjectCardData.model';
import { User } from '@models/User.model';
import { APIManagementService } from '@services/api-management.service';
import { AuthenticationService } from '@services/authentication/authentication.service.js';
import { initFlowbite } from 'flowbite';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, switchMap, tap } from 'rxjs/operators';
import { SDMBaseAccordion } from '../../components/accordion/base-accordion.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { Curriculum } from './../../shared/models/Curriculum.model';
import { classYearList, semesterList, subjects_added, yearsList } from './subject-page-data';

@Component({
	selector: 'sdm-page-subject',
	standalone: true,
	imports: [SDMSelectComponent, SDMSearchBarComponent, CommonModule, SDMfilterBarComponent, SDMPaginationComponent, SDMSubjectComponent, SDMBaseAccordion],
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

	public currentUser: User | null = null;

	public isNavigating: boolean = false;

	public yearsList = yearsList;
	public semesterList = semesterList;
	public classYearList = classYearList;
	public facultyList: Faculty[] = [];
	public departmentList: Department[] = [];
	public programList: Program[] = [];
	public curriculumList: Curriculum[] = [];

	public subjects_added = subjects_added;

	// public searchedSubjectCardDataList: SubjectCardData[] = [];

	public isLoading: boolean = false;
	public isError: boolean = false;
	public isSelectAllDropdown: boolean = false;
	public isGened: string = '';
	public isShowGened: boolean = false;
	public isSignIn: boolean = false;
	public getSubjectDataIsNull: boolean = false;
	public searchSubjectDataIsNull: boolean = false;

	public disableDepartmentSelectDropdown: boolean = false;
	public disableProgramSelectDropdown: boolean = false;
	public disableCurriculumSelectDropdown: boolean = false;

	public selectedDays: string[] = [];
	public selectedRatingFilter: number | null = null;
	public selectedCurriculumData: Curriculum | undefined;
	public selectedCurriculumIdList: number[] = [];

	public isSearched: boolean = false;
	public isFilter: boolean = false;

	// ตัวแปรเดิม
	public subjectCardData: SubjectCardData[] = [];
	// เพิ่มตัวแปรใหม่
	public filteredData: SubjectCardData[] = []; // เก็บผลลัพธ์หลังการ filter
	public searchedData: SubjectCardData[] = []; // เก็บผลลัพธ์หลังการ search
	public finalDisplayData: SubjectCardData[] = []; // เก็บผลลัพธ์สุดท้ายที่จะแสดง

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthenticationService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
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
						this.isGened = params['isGened'];
					}
					if (this.isGened === '0') {
						this.isShowGened = false;
					} else if (this.isGened === '1') {
						this.isShowGened = true;
					}
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
				}),
			)
			.subscribe(() => {
				this.updateDropdownValues();
				this.checkSelectAllDropdown();
				this.isFilter = false;
				this.isSearched = false;
				this.resetAllFilters();
				this.resetSearch();
				if (this.isSelectAllDropdown) {
					this.getSubjectData();
				}
			});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public toggleIsGened() {
		this.isShowGened = !this.isShowGened;
		if (this.isShowGened) {
			this.isGened = '1';
		} else {
			this.isGened = '0';
		}
		this.checkSelectAllDropdown();
		if (this.isSelectAllDropdown) {
			this.navigateToSubject();
		}
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

	// เพิ่ม getter สำหรับความสะดวกในการใช้งาน
	get hasNoResults(): boolean {
		return this.finalDisplayData.length === 0;
	}

	get showNoDataMessage(): boolean {
		return this.isSelectAllDropdown && !this.isLoading && (this.getSubjectDataIsNull || this.hasNoResults);
	}

	get noDataMessageType(): 'api' | 'search' | 'filter' | 'both' {
		if (this.getSubjectDataIsNull) return 'api';
		if (this.isSearched && !this.isFilter) return 'search';
		if (!this.isSearched && this.isFilter) return 'filter';
		return 'both';
	}

	private processDataWithFiltersAndSearch(): void {
		// เริ่มจากข้อมูลต้นฉบับเสมอ
		let processedData = [...this.subjectCardData];

		// ถ้ามีการ search ให้กรองด้วย search ก่อน
		console.log('isSearch in process', this.isSearched);
		if (this.isSearched) {
			processedData = this.searchedData;
		}

		// นำไป filter ต่อ
		if (this.isFilter) {
			processedData = this.filterDay(processedData);
			processedData = this.filterReview(processedData);
			processedData = this.filterCurriculum(processedData);
		}

		// เก็บผลลัพธ์สุดท้าย
		this.finalDisplayData = processedData;
		console.log('final display data :', this.finalDisplayData);
		this.subjectCardTotal = this.finalDisplayData.length;

		// อัพเดท pagination
		this.currentPage = 1;
		this.updatePaginatedItems();
	}

	public onSelectedDaysChange(days: string[]) {
		this.selectedDays = days;
		this.handleFilterBar();
		this.updatePaginatedItems();
	}

	public onReviewFilterValueChange(rating: number) {
		this.selectedRatingFilter = rating;
		this.handleFilterBar();
		this.updatePaginatedItems();
	}

	public onSelectedCurriculumIdChange(curriculumIdList: number[]) {
		this.selectedCurriculumIdList = curriculumIdList;
		this.clearSearch();
		this.handleFilterBar();
		this.updatePaginatedItems();
	}

	public handleFilterBar() {
		this.isFilter = this.selectedDays.length > 0 || this.selectedCurriculumIdList.length > 0 || this.selectedRatingFilter !== null;
		console.log('filter', this.isFilter);
		this.processDataWithFiltersAndSearch();
	}

	public resetAllFilters() {
		this.selectedDays = [];
		this.selectedRatingFilter = null;
		this.selectedCurriculumIdList = [];
		this.isFilter = false;
		this.processDataWithFiltersAndSearch();
	}

	public filterDay(data: SubjectCardData[]) {
		if (this.selectedDays.length === 0) return data;
		return data.filter((data) => this.selectedDays.includes(data.class_datetime[0]));
	}

	public filterReview(data: SubjectCardData[]) {
		if (this.selectedRatingFilter === null || this.selectedRatingFilter === undefined) return data;
		return data.filter((item) => item.rating >= this.selectedRatingFilter! && item.rating < this.selectedRatingFilter! + 1);
	}

	public filterCurriculum(data: SubjectCardData[]) {
		if (this.selectedCurriculumIdList.length === 0) return data;
		return data.filter((data) => data.group_name.some((groupName) => this.selectedCurriculumIdList.includes(groupName.id)));
	}

	public getSearchedSubjectCardDataList(searchResults: SubjectCardData[]) {
		this.searchedData = searchResults;
		console.log('search data :', this.searchedData);
		this.isSearched = searchResults.length !== this.subjectCardData.length;
		this.searchSubjectDataIsNull = searchResults.length === 0;

		this.processDataWithFiltersAndSearch();
	}

	// เพิ่มฟังก์ชันใหม่สำหรับจัดการเมื่อ clear search
	public onSearchCleared() {
		this.isSearched = false;
		this.searchedData = this.isFilter ? [...this.filteredData] : [...this.subjectCardData];
		this.searchSubjectDataIsNull = false;
		console.log('isSearch in onclearsearch', this.isSearched);
		this.processDataWithFiltersAndSearch();
	}

	public resetSearch() {
		this.searchedData = [...this.subjectCardData];
		this.isSearched = false;
		this.processDataWithFiltersAndSearch();
	}

	public searchFunction(data: SubjectCardData[], searchValue: string): SubjectCardData[] {
		return data.filter((subject) => subject?.subject?.id?.toLowerCase().includes(searchValue.toLowerCase()) || subject?.subject?.name_en?.toLowerCase().includes(searchValue.toLowerCase()));
	}

	public updatePaginatedItems() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;

		this.paginatedItems = this.finalDisplayData.slice(start, end);
	}

	public changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	public getSubjectData() {
		this.isLoading = true;
		this.isError = false;

		this.apiManagementService.GetSubjectsDataInSubjectPage(this.selectedYear - 543, this.selectedSemester, this.selectedClassYear, this.selectedCurriculum, this.isGened).subscribe({
			next: (res) => {
				if (res && res.length > 0) {
					this.subjectCardData = res;
					this.subjectCardTotal = this.subjectCardData.length;
					this.processDataWithFiltersAndSearch();
					this.updatePaginatedItems();
				} else {
					console.log('ไม่พบข้อมูลรายวิชาจาก API');
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
				this.facultyList = res;
			}),
			catchError((error) => {
				console.error('Error fetching departmentList:', error);
				return EMPTY;
			}),
		);
	}

	public getDropdownDepartmentsAsObservable(selectedFaculty: number): Observable<Department[]> {
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
				// this.isGened = this.selectedFaculty === 0;

				if (this.selectedFaculty === undefined || this.selectedFaculty === -1 || (oldSelectFaculty !== this.selectedFaculty && oldSelectFaculty !== -1)) {
					this.resetDependentDropdowns('faculty');
				}
				// if (this.selectedFaculty !== -1 && !this.isGened) {
				// 	this.getDropdownDepartmentsAsObservable(this.selectedFaculty).subscribe();
				// }
				if (this.selectedFaculty !== -1) {
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
				console.log('selected curriculum index :', this.selectedCurriculum);
				this.selectedCurriculumData = this.curriculumList[this.selectedCurriculum - 1];
				// console.log('final choose curriculum :', this.selectedCurriculumData);
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}
		this.clearSearch();
		this.checkSelectAllDropdown();
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
				this.selectedDepartment = -1;
				this.selectedProgram = -1;
				this.selectedCurriculum = -1;
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

	private clearSearch() {
		if (this.sdmSearchBar) {
			this.sdmSearchBar.clearSearch();
			this.isSearched = false;
		}
	}

	// public checkSelectAllDropdown() {
	// 	if (
	// 		this.selectedYear !== -1 &&
	// 		this.selectedYear !== undefined &&
	// 		this.selectedSemester !== -1 &&
	// 		this.selectedSemester !== undefined &&
	// 		this.selectedClassYear !== '' &&
	// 		this.selectedClassYear !== '-1' &&
	// 		this.selectedClassYear !== undefined &&
	// 		this.selectedFaculty === 0 &&
	// 		(this.selectedDepartment === -1 || this.selectedDepartment === undefined || isNaN(this.selectedDepartment)) &&
	// 		(this.selectedProgram === -1 || this.selectedProgram === undefined || isNaN(this.selectedProgram)) &&
	// 		(this.selectedCurriculum === -1 || this.selectedCurriculum === 0)
	// 	) {
	// 		this.isSelectAllDropdown = true;
	// 		this.selectedCurriculum = 0;
	// 	} else if (
	// 		this.selectedYear !== -1 &&
	// 		this.selectedYear !== undefined &&
	// 		this.selectedSemester !== -1 &&
	// 		this.selectedSemester !== undefined &&
	// 		this.selectedClassYear !== '' &&
	// 		this.selectedClassYear !== '-1' &&
	// 		this.selectedClassYear !== undefined &&
	// 		this.selectedFaculty !== -1 &&
	// 		this.selectedFaculty !== 0 &&
	// 		this.selectedFaculty !== undefined &&
	// 		this.selectedDepartment !== -1 &&
	// 		this.selectedDepartment !== undefined &&
	// 		!isNaN(this.selectedDepartment) &&
	// 		this.selectedProgram !== -1 &&
	// 		this.selectedProgram !== undefined &&
	// 		!isNaN(this.selectedProgram) &&
	// 		this.selectedCurriculum !== -1 &&
	// 		this.selectedCurriculum !== 0 &&
	// 		this.selectedCurriculum !== undefined
	// 	) {
	// 		this.isSelectAllDropdown = true;
	// 	} else {
	// 		this.isSelectAllDropdown = false;
	// 	}
	// 	this.checkDisableSelectDropdown();
	// }

	public checkSelectAllDropdown() {
		if (
			this.selectedYear !== -1 &&
			this.selectedYear !== undefined &&
			this.selectedSemester !== -1 &&
			this.selectedSemester !== undefined &&
			this.selectedClassYear !== '' &&
			this.selectedClassYear !== '-1' &&
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

	// public navigateToSubject() {
	// 	let latestSubjectUrl: string;

	// 	if (!this.isGened) {
	// 		this.urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedDepartment, this.selectedProgram, this.selectedCurriculum];
	// 	} else if (this.isGened) {
	// 		this.urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedCurriculum];
	// 	}

	// 	if (this.urlSegments) {
	// 		const urlTree = this.router.createUrlTree(this.urlSegments);
	// 		latestSubjectUrl = urlTree.toString();

	// 		const navigationExtras: NavigationExtras = {
	// 			skipLocationChange: false,
	// 			replaceUrl: true,
	// 		};

	// 		this.router
	// 			.navigate([latestSubjectUrl], navigationExtras)
	// 			.then((success) => {
	// 				if (success) {
	// 					console.log('Navigation successful!');
	// 					this.getSubjectData();
	// 				}
	// 			})
	// 			.catch((error) => {
	// 				console.error('Navigation error:', error);
	// 			});
	// 	}
	// }

	public navigateToSubject() {
		let latestSubjectUrl: string;

		this.urlSegments = ['/subject', this.selectedYear, this.selectedSemester, this.selectedClassYear, this.selectedFaculty, this.selectedDepartment, this.selectedProgram, this.selectedCurriculum, this.isGened];

		if (this.urlSegments) {
			const urlTree = this.router.createUrlTree(this.urlSegments);
			latestSubjectUrl = urlTree.toString();

			const navigationExtras: NavigationExtras = {
				skipLocationChange: false,
				replaceUrl: true,
			};

			this.router
				.navigate([latestSubjectUrl], navigationExtras)
				.then((success) => {
					if (success) {
						console.log('Navigation successful!');
						this.getSubjectData();
					}
				})
				.catch((error) => {
					console.error('Navigation error:', error);
				});
		}
	}

	// public getSearchedSubjectCardDataList(SubjectCardDataListbySearch: SubjectCardData[]) {
	// 	this.searchedSubjectCardDataList = SubjectCardDataListbySearch;
	// 	this.searchSubjectDataIsNull = this.searchedSubjectCardDataList.length === 0;
	// 	this.searchedSubjectCardDataList === this.subjectCardData ? (this.isSearched = false) : (this.isSearched = true);
	// 	this.currentPage = 1;
	// 	this.updatePaginatedItems();
	// }
}
