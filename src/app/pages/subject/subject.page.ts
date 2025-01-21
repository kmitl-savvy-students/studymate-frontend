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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { CommonModule } from '@angular/common';
import { APIManagementService } from '../../shared/services/api-management.service.js';

import { User } from '../../shared/models/User.model';

import { Router } from '@angular/router';
import { Curriculum } from '../../shared/models/Curriculum.model.js';

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
		this.route.params.subscribe((params) => {
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
		});
		this.getCurriculumsData().then(() => {
			this.updateDropdownValues();
			this.checkSelectAllDropdown();
			if (this.isSelectAllDropdown) {
				this.getSubjectData();
			}
		});
		console.log('router url after navigate', this.router.url);
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

	public getCurriculumsData(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.apiManagementService.GetCurriculum().subscribe({
				next: (res) => {
					this.curriculumsData = res.filter(
						(s) => s.pid === '06' || s.pid === '101',
					);
					this.curriculumList = this.curriculumsData.map(
						(curriculum) => {
							const dropdown = new DropdownList();
							dropdown.label = `${curriculum.name_th} (${curriculum.year})`;
							dropdown.value = curriculum.pid;
							return dropdown;
						},
					);
					this.curriculumOptions = this.curriculumsData.map(
						(curriculum) => {
							const curriculumOptions = new CirriculumnList();
							curriculumOptions.value = curriculum.pid;
							curriculumOptions.uniqueId = curriculum.unique_id;
							curriculumOptions.curriculumYear = curriculum.year;
							return curriculumOptions;
						},
					);
					resolve();
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
					reject(error);
				},
			});
		});
	}

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
				break;
			case 'selectedDepartment':
				this.selectedDepartment = selectedData.value;
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
				this.selectedYear &&
				this.selectedSemester &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty &&
				this.selectedDepartment
			) {
				this.selectedCurriculum = 'x';
				this.selectedCurriculumYear = '';
				this.selectedUniqueId = '';
				this.isSelectAllDropdown = true;
				this.updatePaginatedItems();
			} else {
				this.isSelectAllDropdown = false;
			}
		} else {
			this.isGened = false;
			if (
				this.selectedYear &&
				this.selectedSemester &&
				this.selectedClassYear !== undefined &&
				this.selectedFaculty &&
				this.selectedDepartment &&
				this.selectedCurriculum
			) {
				this.isSelectAllDropdown = true;
			} else {
				this.isSelectAllDropdown = false;
			}
		}
	}

	private isCurrentUrl(url: string): boolean {
		return this.router.url === url;
	}

	public navigateToSubject() {
		const latestSubjectUrl = this.router
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

		if (!this.isCurrentUrl(latestSubjectUrl)) {
			this.isNavigating = true;
			this.router.navigateByUrl(latestSubjectUrl).then((success) => {
				if (success) {
					if (this.isSelectAllDropdown) {
						this.getSubjectData();
					}
				} else {
					console.error('Navigation failed.');
				}
				this.isNavigating = false;
			});
			console.log('router url before navigate', this.router.url);
			console.log('goToSubjectUrl', latestSubjectUrl);
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
