import {
	classYearList,
	departmentList,
	engineerDeList,
	engineerFacList,
	facultyList,
	genedDeList,
	genedFacList,
	semesterList,
	subjects_added,
	yearsList,
} from './subject-page-data';
import {
	SelectedData,
	DropdownList,
	CirriculumnList,
} from './../../shared/models/SdmAppService.model.js';
import {
	Component,
	AfterViewInit,
	OnInit,
	ViewChildren,
	QueryList,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { ActivatedRoute } from '@angular/router';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { CommonModule } from '@angular/common';
import { APIManagementService } from '../../shared/services/api-management.service.js';

import { User } from '../../shared/models/User.model';

import { Router } from '@angular/router';
import { Curriculum } from '../../shared/models/Curriculum.model.js';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMilterBarComponent,
		SDMPaginationComponent,
		CommonModule,
		SDMSubjectComponent,
	],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit, OnInit, OnChanges {
	@ViewChildren(SDMSelectComponent) dropdowns!: QueryList<SDMSelectComponent>;
	public currentPage: number = 1;
	public itemsPerPage: number = 10;
	public paginatedItems: SubjectCardData[] = [];
	public subjectCardTotal: number = 0;

	public selectedYear: number = 0;
	public selectedSemester: number = 0;
	public selectedClassYear: number = -1;
	public selectedFaculty: string = '';
	public selectedDepartment: string = '';
	public selectedCurriculum?: string = '';
	public selectedUniqueId?: string = '';
	public selectedCurriculumYear?: string = '';
	public selectedData?: SelectedData;

	public currentRoute: string = '';
	public user: User | null = null;
	public isNavigating: boolean = false;

	public yearsList = yearsList;
	public semesterList = semesterList;
	public classYearList = classYearList;
	public facultyList = facultyList;
	public departmentList = departmentList;
	public curriculumList: DropdownList[] = [];
	public curriculumsData: Curriculum[] = [];
	public curriculumOptions: any[] = [];

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
	public disableCurriculumSelectDropdown: boolean = false;
	public disableDepartmentSelectDropdown: boolean = false;

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
						this.selectedFaculty = params['faculty'];
						this.selectedDepartment = params['department'];
						this.selectedCurriculum = params['curriculum'];
						this.selectedClassYear = +params['classYear'];
						this.selectedCurriculumYear = params['curriculumYear'];
						this.selectedUniqueId = params['uniqueId'];
					}

					//return this.getCurriculumsData();
					return [];
				}),
			)
			.subscribe(() => {
				this.updateDropdownValues();

				this.checkSelectAllDropdown();

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
					const option = this.yearsList.find(
						(option) => option.value === this.selectedYear,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.yearsList.indexOf(option),
							option.value,
						);
					}
					break;
				}
				case 'selectedSemester': {
					const option = this.semesterList.find(
						(option) => option.value === this.selectedSemester,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.semesterList.indexOf(option),
							option.value,
						);
					}
					break;
				}
				case 'selectedClassYear': {
					const option = this.classYearList.find(
						(option) => option.value === this.selectedClassYear,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.classYearList.indexOf(option),
							option.value,
						);
					}
					break;
				}
				case 'selectedFaculty': {
					const option = this.facultyList.find(
						(option) => option.value === this.selectedFaculty,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.facultyList.indexOf(option),
							option.value,
						);
					}
					break;
				}
				case 'selectedDepartment': {
					const option = this.departmentList.find(
						(option) => option.value === this.selectedDepartment,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.departmentList.indexOf(option),
							option.value,
						);
					}
					break;
				}
				case 'selectedCurriculum': {
					const option = this.curriculumList.find(
						(option) => option.value === this.selectedCurriculum,
					);
					if (option) {
						dropdown.onSelectedOption(
							option.label,
							this.curriculumList.indexOf(option),
							option.value,
						);
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
		const dataToPaginate = this.isSearched
			? this.filteredSubjectCardDataList
			: this.subjectCardData;
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

		this.apiManagementService
			.GetCurriculumSubjectsTeachtable(
				this.selectedYear,
				this.selectedSemester,
				this.selectedFaculty,
				this.selectedDepartment,
				this.selectedCurriculum!,
				this.selectedClassYear,
				this.selectedCurriculumYear,
				this.selectedUniqueId,
			)
			.subscribe({
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
					if (error.status === 404) {
						console.error('Not found');
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}

					this.isError = true;
					this.isLoading = false;
				},
			});
	}

	/* TODO: FIX THIS
	public getCurriculumsData() {
		return this.apiManagementService.GetCurriculum().pipe(
			tap((res) => {
				this.curriculumsData = res.filter(
					(s) => s.pid === '06' || s.pid === '101',
				);
				this.curriculumList = this.curriculumsData.map((curriculum) => {
					const dropdown = new DropdownList();
					dropdown.label = `${curriculum.name_th} (${curriculum.year})`;
					dropdown.value = curriculum.pid;
					return dropdown;
				});
				this.curriculumOptions = this.curriculumsData.map(
					(curriculum) => {
						const curriculumOptions = new CirriculumnList();
						curriculumOptions.value = curriculum.pid;
						curriculumOptions.uniqueId = curriculum.unique_id;
						curriculumOptions.curriculumYear = curriculum.year;
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

	public handleChooseFaculty(list: DropdownList[]) {
		if (this.selectedFaculty === '90') {
			this.isGened = true;
			return genedDeList;
		} else if (this.selectedFaculty === '01') {
			return engineerDeList;
		}
		return list;
	}

	public handleChooseDepartment(list: DropdownList[]) {
		if (this.selectedDepartment === '90') {
			this.isGened = true;
			return genedFacList;
		} else if (this.selectedDepartment === '05') {
			return engineerFacList;
		}
		return list;
	}

	public handleSelectChange(selectName: string, selectedData: SelectedData) {
		this.subjectCardData = [];
		this.getSubjectDataIsNull = false;
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
				if (
					this.selectedFaculty === undefined ||
					this.selectedFaculty === ''
				) {
					this.resetDropdowns('selectedDepartment');
					this.resetDropdowns('selectedCurriculum');
				}
				break;
			case 'selectedDepartment':
				this.selectedDepartment = selectedData.value;
				if (
					this.selectedDepartment === undefined ||
					this.selectedDepartment === ''
				) {
					this.resetDropdowns('selectedCurriculum');
				}
				break;
			case 'selectedCurriculum':
				this.selectedCurriculum = selectedData.value;
				const matchedCurriculum = this.curriculumOptions.find(
					(item) => item.value === selectedData.value,
				);
				this.selectedUniqueId = matchedCurriculum?.uniqueId;
				this.selectedCurriculumYear = matchedCurriculum?.curriculumYear;
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}
		this.checkSelectAllDropdown();
		if (this.isSelectAllDropdown && !this.isNavigating) {
			this.navigateToSubject();
		}
	}

	public checkSelectAllDropdown() {
		if (this.selectedFaculty === '90' && this.selectedDepartment === '90') {
			if (
				this.selectedYear !== 0 &&
				this.selectedYear !== undefined &&
				this.selectedSemester !== 0 &&
				this.selectedSemester !== undefined &&
				this.selectedClassYear !== -1 &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty === '90' &&
				this.selectedDepartment === '90'
			) {
				this.selectedCurriculum = 'x';
				this.selectedCurriculumYear = '';
				this.selectedUniqueId = '';
				this.isSelectAllDropdown = true;
			} else {
				this.isSelectAllDropdown = false;
			}
		} else {
			this.isGened = false;
			if (
				this.selectedYear !== 0 &&
				this.selectedYear !== undefined &&
				this.selectedSemester !== 0 &&
				this.selectedSemester !== undefined &&
				this.selectedClassYear !== -1 &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty !== '90' &&
				this.selectedFaculty !== undefined &&
				this.selectedDepartment &&
				this.selectedDepartment !== '90' &&
				this.selectedDepartment !== undefined &&
				this.selectedCurriculum !== 'x' &&
				this.selectedCurriculum !== undefined &&
				this.selectedUniqueId !== '' &&
				this.selectedUniqueId !== undefined &&
				this.selectedCurriculumYear !== '' &&
				this.selectedCurriculumYear !== undefined
			) {
				this.isSelectAllDropdown = true;
			} else {
				this.isSelectAllDropdown = false;
			}
		}
		console.log('isSelectAllDropdown:', this.isSelectAllDropdown);
		this.checkDisableSelectDropdown();
	}

	public resetDropdowns(selectName?: string) {
		this.dropdowns.forEach((dropdown) => {
			if (dropdown.SelectName === selectName) {
				dropdown.onSelectedOption('', -1, '');
			}
		});
	}

	public checkDisableSelectDropdown() {
		if (
			this.selectedFaculty === '90' ||
			this.selectedDepartment === '90' ||
			this.isGened ||
			this.selectedFaculty === '' ||
			this.selectedFaculty === undefined ||
			this.selectedDepartment === '' ||
			this.selectedDepartment === undefined
		) {
			this.disableCurriculumSelectDropdown = true;
		} else {
			this.disableCurriculumSelectDropdown = false;
		}

		if (
			this.selectedFaculty === '' ||
			(this.selectedFaculty === undefined && this.dropdowns)
		) {
			this.disableDepartmentSelectDropdown = true;
		} else {
			this.disableDepartmentSelectDropdown = false;
		}
	}

	private isCurrentUrl(url: string): boolean {
		return this.router.url === url;
	}

	public navigateToSubject() {
		let latestSubjectUrl: string;

		if (
			this.selectedYear === 0 &&
			this.selectedSemester === 0 &&
			this.selectedClassYear === -1 &&
			this.selectedFaculty === '' &&
			this.selectedDepartment === '' &&
			this.selectedCurriculum === '' &&
			this.selectedUniqueId === '' &&
			this.selectedCurriculumYear === ''
		) {
			// ใช้เส้นทางเริ่มต้นแบบไม่เลือกอะไรเลย
			latestSubjectUrl = this.router
				.createUrlTree(['/subject'])
				.toString();
		} else if (
			this.selectedFaculty === '90' &&
			this.selectedDepartment === '90' &&
			this.selectedCurriculum === 'x' &&
			this.isSelectAllDropdown
		) {
			// ใช้เส้นทางสำหรับกรณี selectedFaculty === '90' && selectedDepartment === '90'
			latestSubjectUrl = this.router
				.createUrlTree([
					'/subject',
					this.selectedYear,
					this.selectedSemester,
					this.selectedFaculty,
					this.selectedDepartment,
					this.selectedCurriculum,
					this.selectedClassYear,
				])
				.toString();
		} else if (
			this.selectedFaculty !== '90' &&
			this.selectedFaculty !== '' &&
			this.selectedFaculty !== undefined &&
			this.selectedDepartment !== '90' &&
			this.selectedDepartment !== '' &&
			this.selectedDepartment !== undefined &&
			this.selectedCurriculum !== 'x' &&
			this.selectedCurriculum !== '' &&
			this.selectedCurriculum !== undefined &&
			this.isSelectAllDropdown === true &&
			this.isSelectAllDropdown
		) {
			// ใช้เส้นทางสำหรับกรณี selectedFaculty === '01' && selectedDepartment === '05'
			latestSubjectUrl = this.router
				.createUrlTree([
					'/subject',
					this.selectedYear,
					this.selectedSemester,
					this.selectedFaculty,
					this.selectedDepartment,
					this.selectedCurriculum,
					this.selectedClassYear,
					this.selectedCurriculumYear,
					this.selectedUniqueId,
				])
				.toString();
		} else {
			return;
		}

		if (!this.isCurrentUrl(latestSubjectUrl)) {
			this.isNavigating = true;
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

	public getSearchedSubjectCardDataList(
		filteredSubjectCardDataList: SubjectCardData[],
	) {
		this.filteredSubjectCardDataList = filteredSubjectCardDataList;
		this.searchSubjectDataIsNull =
			this.filteredSubjectCardDataList.length === 0;
		this.isSearched = true;
		this.currentPage = 1;
		this.updatePaginatedItems();
	}

	public searchFunction(
		data: SubjectCardData[],
		searchValue: string,
	): SubjectCardData[] {
		return data.filter(
			(subject) =>
				subject.subject_id
					.toLowerCase()
					.includes(searchValue.toLowerCase()) ||
				subject.subject_name_en
					.toLowerCase()
					.includes(searchValue.toLowerCase()),
		);
	}
}
