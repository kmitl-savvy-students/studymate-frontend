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
	SubjectData,
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
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { RouterLink } from '@angular/router';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { CommonModule } from '@angular/common';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User.model';
import { distinctUntilChanged, filter, of, Subject } from 'rxjs';
import { UserToken } from '../../shared/models/UserToken.model';
import { NavigationEnd, Router } from '@angular/router';
import { Curriculum } from '../../shared/models/Curriculum.model.js';
import { CurriculumTeachtableSubject } from '../../shared/models/CurriculumTeachtableSubject.model.js';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMSubjectAddedModalComponent,
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
	public isSelectAllDropdown: boolean = false;
	public isGened: boolean = false;

	public currentRoute: string = '';
	public user: User | null = null;
	public isSignIn: boolean = false;

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

	public SubjectDataIsNull: boolean = false;
	public isSearched: boolean = false;
	public isLoading: boolean = false;
	public isError: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private authService: AuthService,
	) {
		// this.router.events
		// 	.pipe(filter((event) => event instanceof NavigationEnd))
		// 	.subscribe((event: any) => {
		// 		this.currentRoute = event.url;
		// 	});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isLoading']) {
			// ตรวจสอบว่ามีการเปลี่ยนแปลงใน isLoading
			console.log('Loading:', changes['isLoading'].currentValue); // แสดงค่าปัจจุบัน
		}
	}

	// public userTokenSubject: Subject<UserToken | null> =
	// 	new Subject<UserToken | null>();

	ngOnInit(): void {
		this.getCurriculumsData();
		// this.authService.userTokenSubject
		// 	.pipe(
		// 		filter((token) => token !== null),
		// 		distinctUntilChanged(),
		// 	)
		// 	.subscribe((userToken) => {
		// 		let user = userToken.user;
		// 		if (user) {
		// 			this.isSignIn = true;
		// 			this.user = user;
		// 		} else {
		// 			this.isSignIn = false;
		// 		}
		// 	});
	}

	ngAfterViewInit(): void {
		initFlowbite();
		this.checkSelectAllDropdown();
	}

	public closeAllDropdowns(except?: SDMSelectComponent) {
		this.dropdowns.forEach((dropdown) => {
			if (dropdown !== except) {
				dropdown.isDropdownOpen = false;
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

	getSubjectData() {
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
					console.log('API Response:', res);
					if (
						res &&
						res[0] &&
						res[0].teachtable &&
						res[0].teachtable[0]
					) {
						this.subjectCardData = res[0].teachtable[0].data;
						if (this.subjectCardData !== undefined) {
							console.log(
								'Subject Card Data:',
								this.subjectCardData,
							);
							this.subjectCardTotal = this.subjectCardData.length;
							this.updatePaginatedItems();
						} else {
							console.log('No Subject Data Available.');
						}
					} else {
						console.log(
							'teachtable or required nested data is undefined',
						);
						this.subjectCardData = [];
						this.SubjectDataIsNull = true;
						console.log(this.SubjectDataIsNull);
					}
					this.isLoading = false;
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

	public getCurriculumsData() {
		this.apiManagementService.GetCurriculum().subscribe({
			next: (res) => {
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
				console.log(this.curriculumOptions);
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
			},
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
		// อัปเดตสถานะที่เกี่ยวข้องตาม selectName
		this.subjectCardData = [];
		this.SubjectDataIsNull = false;
		switch (selectName) {
			case 'selectedYear':
				this.selectedYear = selectedData.value;
				console.log('Selected Year !:', this.selectedYear);
				break;
			case 'selectedSemester':
				this.selectedSemester = selectedData.value;
				console.log('Selected Semester:', this.selectedSemester);
				break;
			case 'selectedClassYear':
				this.selectedClassYear = selectedData.value;
				console.log('Selected Class:', this.selectedClassYear);
				break;
			case 'selectedFaculty':
				this.selectedFaculty = selectedData.value;
				console.log('Selected Faculty:', this.selectedFaculty);
				break;
			case 'selectedDepartment':
				this.selectedDepartment = selectedData.value;
				console.log('Selected Department:', this.selectedDepartment);
				break;
			case 'selectedCurriculum':
				this.selectedCurriculum = selectedData.value;

				const matchedCurriculum = this.curriculumOptions.find(
					(item) => item.value === selectedData.value,
				);
				this.selectedUniqueId = matchedCurriculum?.uniqueId;
				this.selectedCurriculumYear = matchedCurriculum?.curriculumYear;

				console.log('Selected Curriculum:', this.selectedCurriculum);
				break;
			default:
				console.warn(`Unhandled select: ${selectName}`);
		}

		this.checkSelectAllDropdown();

		if (this.isSelectAllDropdown) {
			console.log('All dropdowns selected, calling getSubjectData()');
			this.getSubjectData();
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
			console.log('isSelectAllDropdown', this.isSelectAllDropdown);
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
			console.log('isSelectAllDropdown', this.isSelectAllDropdown);
		}
	}

	public getFilterSubjectCardDataList(
		filteredSubjectCardDataList: SubjectCardData[],
	) {
		this.filteredSubjectCardDataList = filteredSubjectCardDataList;
		this.isSearched = true;
		this.currentPage = 1;
		this.updatePaginatedItems();
	}
}
