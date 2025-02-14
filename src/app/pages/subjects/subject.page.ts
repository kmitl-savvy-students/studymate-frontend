import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SDMilterBarComponent } from '@components/filter-bar/filter-bar.component';
import { SDMPaginationComponent } from '@components/pagination/pagination.component';
import { SDMSearchBarComponent } from '@components/search-bar/search-bar.component';
import { SDMSelectComponent } from '@components/select/select.component';
import { SDMSubjectComponent } from '@components/subject/subject.component';
import { Curriculum } from '@models/Curriculum.model';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { Program } from '@models/Program.model';
import { SelectedData } from '@models/SdmAppService.model';
import { SubjectCardData } from '@models/SubjectCardData.model';
import { User } from '@models/User.model';
import { APIManagementService } from '@services/api-management.service';
import { initFlowbite } from 'flowbite';
import { EMPTY, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { classYearList, semesterList, subjects_added, yearsList } from './subject-page-data';

@Component({
	selector: 'sdm-page-subject',
	standalone: true,
	imports: [SDMSelectComponent, SDMSearchBarComponent, SDMPaginationComponent, CommonModule, SDMSubjectComponent, SDMilterBarComponent],
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
	public selectedClassYear: number = -1;
	public selectedFaculty: number = -1;
	public selectedProgram: number = -1;
	public selectedDepartment: number = -1;
	public selectedCurriculum?: string = '';
	public selectedUniqueId?: string = '';
	public selectedCurriculumYear?: string = '';
	public selectedCurriculumIndex?: number = -1;
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

	// public curriculumsData: Curriculum[] = [];
	// public curriculumOptions: any[] = [];

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
						this.selectedFaculty = +params['faculty'];
						this.selectedDepartment = params['department'];
						this.selectedCurriculum = params['curriculum'];
						this.selectedClassYear = +params['classYear'];
						this.selectedCurriculumYear = params['curriculumYear'];
						this.selectedCurriculumIndex = +params['curriculumIndex'];
						this.selectedUniqueId = params['uniqueId'];
					}
					return this.getDropdownFaculties();
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
					const option = this.classYearList.find((option) => option.value === this.selectedClassYear);
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

		// this.apiManagementService.GetCurriculumSubjectsTeachtable(this.selectedYear, this.selectedSemester, this.selectedFaculty, this.selectedDepartment, this.selectedCurriculum!, this.selectedClassYear, this.selectedCurriculumYear, this.selectedUniqueId).subscribe({
		// 	next: (res) => {
		// 		if (res && res.length > 0) {
		// 			this.subjectCardData = res;
		// 			console.log('subjectCardData : ', this.subjectCardData);
		// 			this.subjectCardTotal = this.subjectCardData.length;
		// 			this.updatePaginatedItems();
		// 		} else {
		// 			console.log('No Subject Data Available.');
		// 			this.subjectCardData = [];
		// 			this.getSubjectDataIsNull = true;
		// 		}
		// 		this.isLoading = false;
		// 		this.currentPage = 1;
		// 	},
		// 	error: (error) => {
		// 		if (error.status === 404) {
		// 			console.error('Not found');
		// 		} else if (error.status === 500) {
		// 			console.error('Internal Server Error');
		// 		} else {
		// 			console.error('An unexpected error occurred:', error.status);
		// 		}

		// 		this.isError = true;
		// 		this.isLoading = false;
		// 	},
		// });
	}

	/* TODO: FIX THIS
	public getCurriculumsData() {
		return this.apiManagementService.GetCurriculum().pipe(
			tap((res) => {
				this.curriculumsData = res.filter(
					(s) => s.pid === '06' || s.pid === '101',
				);
				this.curriculumList = this.curriculumsData.map(
					(curriculum, index) => {
						const dropdown = new DropdownList();
						dropdown.label = `${curriculum.name_th} (${curriculum.year})`;
						dropdown.value = curriculum.pid;
						dropdown.index = index;
						return dropdown;
					},
				);
				this.curriculumOptions = this.curriculumsData.map(
					(curriculum, index) => {
						const curriculumOptions = new CirriculumnList();
						curriculumOptions.value = curriculum.pid;
						curriculumOptions.uniqueId = curriculum.unique_id;
						curriculumOptions.curriculumYear = curriculum.year;
						curriculumOptions.index = index;
						return curriculumOptions;
					},
				);
			}),
			catchError((error) => {
				console.error('Error fetching curriculum:', error);
				return EMPTY;
			}),
		);
	}
	*/

	public getDropdownFaculties(): Observable<Faculty[]> {
		return this.apiManagementService.GetDropdownFaculties().pipe(
			tap((res) => {
				this.facultyList = res;
				console.log('get facultyList:', this.facultyList);
			}),
			catchError((error) => {
				console.error('Error fetching facultyList:', error);
				return EMPTY; // ป้องกัน error ให้ observable ไม่พัง
			}),
		);
	}

	public getDropdownDepartments(selectedFaculty: number) {
		this.apiManagementService.GetDropdownDepartments(selectedFaculty).subscribe({
			next: (res) => {
				if (res) {
					this.departmentList = res;
					console.log('get departmentList : ', this.departmentList);
				}
			},
			error: (error) => {
				console.error('Error fetching departmentList:', error);
			},
		});
	}

	public getDropdownPrograms(selectedDepartment: number) {
		this.apiManagementService.GetDropdownPrograms(selectedDepartment).subscribe({
			next: (res) => {
				if (res) {
					this.programList = res;
					console.log('get programtList : ', this.programList);
				}
			},
			error: (error) => {
				console.error('Error fetching departmentList:', error);
			},
		});
	}

	public getDropdownCurriculums(selectedProgram: number) {
		this.apiManagementService.GetDropdownCurriculums(selectedProgram).subscribe({
			next: (res) => {
				if (res) {
					this.curriculumList = res.map((curriculum) => {
						return {
							...curriculum,
							name_th: `${curriculum.name_th} (${curriculum.year})`,
							name_en: `${curriculum.name_en} (${curriculum.year})`,
						};
					});
					console.log('get curriculumList : ', this.curriculumList);
				}
			},
			error: (error) => {
				console.error('Error fetching curriculumList:', error);
			},
		});
	}

	// public handleChooseFaculty(list: DropdownList[]) {
	// 	if (this.selectedFaculty === '90') {
	// 		this.isGened = true;
	// 		return genedDeList;
	// 	} else if (this.selectedFaculty === '01') {
	// 		return engineerDeList;
	// 	}
	// 	return list;
	// }

	// public handleChooseDepartment(list: DropdownList[]) {
	// 	if (this.selectedDepartment === '90') {
	// 		this.isGened = true;
	// 		return genedFacList;
	// 	} else if (this.selectedDepartment === '05') {
	// 		return engineerFacList;
	// 	}
	// 	return list;
	// }

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
				this.selectedClassYear = selectedData.value;
				break;
			case 'selectedFaculty':
				this.selectedFaculty = selectedData.value;
				if (this.selectedFaculty === undefined || this.selectedFaculty === -1) {
					this.resetDropdowns('selectedDepartment');
					this.resetDropdowns('selectedProgram');
				} else {
					this.getDropdownDepartments(this.selectedFaculty);
				}
				console.log('selectedFaculty', this.selectedFaculty);
				break;
			case 'selectedDepartment':
				this.selectedDepartment = selectedData.value;

				if (this.selectedDepartment === undefined || this.selectedDepartment === -1) {
					this.resetDropdowns('selectedProgram');
					this.resetDropdowns('selectedCurriculum');
				} else {
					this.getDropdownPrograms(this.selectedDepartment);
				}
				console.log('selectedDepartment', this.selectedDepartment);
				break;
			case 'selectedProgram':
				this.selectedProgram = selectedData.value;
				if (this.selectedProgram === undefined || this.selectedProgram === -1) {
					this.resetDropdowns('selectedCurriculum');
				} else {
					this.getDropdownCurriculums(this.selectedProgram);
				}
				console.log('selectedProgram', this.selectedProgram);
				console.log('selectedCurriculum', this.selectedCurriculum);
				break;
			case 'selectedCurriculum':
				this.selectedCurriculum = selectedData.value.toString();
				const selectedCurriculumOption = this.curriculumList.find((selectedCurriculumOption) => selectedCurriculumOption.id.toString() === this.selectedCurriculum);
				if (selectedCurriculumOption) {
					this.selectedCurriculumYear = selectedCurriculumOption.year.toString();
				}
				// this.selectedUniqueId = matchedCurriculum?.uniqueId;

				console.log('selectedCurriculum', this.selectedCurriculum);
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}
		this.checkSelectAllDropdown();
		console.log('isSelectAllDropdown : ', this.isSelectAllDropdown);
		if (this.isSelectAllDropdown && !this.isNavigating) {
			console.log('55555555555555555555555555555555555555555555');
			this.navigateToSubject();
		}
	}

	private clearSearch() {
		if (this.sdmSearchBar) {
			this.sdmSearchBar.clearSearch();
		}
	}

	public checkSelectAllDropdown() {
		if (this.selectedFaculty === 90 && this.selectedDepartment === 90) {
			if (this.selectedYear !== 0 && this.selectedYear !== undefined && this.selectedSemester !== 0 && this.selectedSemester !== undefined && this.selectedClassYear !== -1 && this.selectedClassYear !== undefined && this.selectedFaculty === 90 && this.selectedDepartment === 90) {
				this.selectedCurriculum = 'x';
				this.selectedCurriculumYear = '';
				this.selectedUniqueId = '';
				this.isSelectAllDropdown = true;
				console.log('111111111111111111111111111111111111111');
			} else {
				this.isSelectAllDropdown = false;
				console.log('222222222222222222222222222222222222222');
			}
		} else {
			this.isGened = false;
			// ยังไม่ได้เช็คเงื่อนไขของ selectUniqeID นะ
			if (this.selectedYear !== -1 && this.selectedYear !== undefined && this.selectedSemester !== -1 && this.selectedSemester !== undefined && this.selectedClassYear !== -1 && this.selectedClassYear !== undefined && this.selectedFaculty !== -1 && this.selectedFaculty !== 90 && this.selectedFaculty !== undefined && this.selectedDepartment !== -1 && this.selectedDepartment !== 90 && this.selectedDepartment !== undefined && this.selectedCurriculum !== '' && this.selectedCurriculum !== '-1' && this.selectedCurriculum !== 'x' && this.selectedCurriculum !== undefined && this.selectedCurriculumYear !== '' && this.selectedCurriculumYear !== undefined) {
				this.isSelectAllDropdown = true;
				console.log('3333333333333333333333333333333333333333');
			} else {
				this.isSelectAllDropdown = false;
				console.log('4444444444444444444444444444444444444444');
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

	private isCurrentUrl(url: string): boolean {
		return this.router.url === url;
	}

	public navigateToSubject() {
		let latestSubjectUrl: string;

		if (this.selectedYear === -1 && this.selectedSemester === -1 && this.selectedClassYear === -1 && this.selectedFaculty === -1 && this.selectedDepartment === -1 && this.selectedCurriculum === '' && this.selectedUniqueId === '' && this.selectedCurriculumYear === '') {
			// ใช้ path เริ่มต้นแบบไม่เลือกอะไรเลย
			latestSubjectUrl = this.router.createUrlTree(['/subject']).toString();
			console.log('666666666666666666666666666666666666666');
			console.log('latestSubjectUrl : ', latestSubjectUrl);
		} else if (this.selectedFaculty === 90 && this.selectedDepartment === 90 && this.selectedCurriculum === 'x' && this.isSelectAllDropdown) {
			// ใช้ path สำหรับกรณี GenEd รอ Api นิ่งก่อน เดี๋ยวมาแก้ต่อ
			latestSubjectUrl = this.router.createUrlTree(['/subject', this.selectedYear, this.selectedSemester, this.selectedFaculty, this.selectedDepartment, this.selectedCurriculum, this.selectedClassYear]).toString();
		} else if (this.selectedFaculty !== -1 && this.selectedFaculty !== 90 && this.selectedFaculty !== undefined && this.selectedDepartment !== -1 && this.selectedDepartment !== 90 && this.selectedDepartment !== undefined && this.selectedCurriculum !== '' && this.selectedCurriculum !== 'x' && this.selectedCurriculum !== undefined && this.isSelectAllDropdown) {
			// ใช้ path สำหรับกรณี ไม่ใช่ GenEd รอ Api นิ่งก่อน เดี๋ยวมาแก้ต่อ
			latestSubjectUrl = this.router.createUrlTree(['/subject', this.selectedYear, this.selectedSemester, this.selectedFaculty, this.selectedDepartment, this.selectedCurriculum, this.selectedClassYear, this.selectedCurriculumYear, this.selectedUniqueId]).toString();
			console.log('77777777777777777777777777777777777777777');
			console.log('latestSubjectUrl : ', latestSubjectUrl);
		} else {
			return;
		}

		if (!this.isCurrentUrl(latestSubjectUrl)) {
			this.isNavigating = true;
			this.clearSearch();
			this.router
				.navigateByUrl(latestSubjectUrl)
				.then((success) => {
					if (success) {
						console.log('Navigation successful!');
					} else {
						console.error('Navigation failed.');
					}
					this.isNavigating = false;
				})
				.catch((error) => {
					console.error('Navigation error:', error);
					this.isNavigating = false;
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
		return data.filter((subject) => subject.subject_id.toLowerCase().includes(searchValue.toLowerCase()) || subject.subject_name_en.toLowerCase().includes(searchValue.toLowerCase()));
	}
}
