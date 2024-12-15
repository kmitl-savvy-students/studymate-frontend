import {
	classYearList,
	departmentList,
	facultyList,
	semesterList,
	subjectCardData,
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
} from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
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
export class SDMSubject implements AfterViewInit, OnInit {
	@ViewChildren(SDMSelectComponent) dropdowns!: QueryList<SDMSelectComponent>;
	public currentPage: number = 1;
	public itemsPerPage: number = 10;
	public paginatedItems: SubjectCardData[] = [];
	public subjectCardTotal: number = 0;

	public selectedYear: number = 0;
	public selectedSemester: number = 0;
	public selectedClassYear: number = 0;
	public selectedFaculty: string = '';
	public selectedDepartment: string = '';
	public selectedCurriculum: string = '';
	public selectedUniqueId: string = '';
	public selectedCurriculumYear: string = '';
	public selectedData?: SelectedData;
	public isSelectAllDropdown: boolean = false;

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

	public SubjectsTeachtableData?: CurriculumTeachtableSubject;
	public subjectCardData = subjectCardData;
	public subjects_added = subjects_added;

	public filteredSubjectCardDataList: SubjectCardData[] = [];
	public isSearched: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private authService: AuthService,
	) {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: any) => {
				this.currentRoute = event.url;
			});
	}

	public userTokenSubject: Subject<UserToken | null> =
		new Subject<UserToken | null>();

	ngOnInit(): void {
		this.getCurriculumsData();
		this.authService.userTokenSubject
			.pipe(
				filter((token) => token !== null),
				distinctUntilChanged(),
			)
			.subscribe((userToken) => {
				let user = userToken.user;
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
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

	// public createLabelsDDL(ddl : DropdownList[]){
	// 	return ddl.map(data => data.label)
	// }

	// public getValue(ddlData: DropdownList[], selectedData: SelectedData){
	// 	const matchedItem = ddlData.find(item => item.label === selectedData.label);
	// 	return matchedItem ? matchedItem.value : undefined;
	// }

	// getSubjectData(){
	// 	this.apiManagementService.GetCurriculumSubjectsTeachtable(this.selectedYear, this.selectedSemester, this.selectedFaculty, this.selectedDepartment, this.selectedCurriculum, this.selectedClassYear, this.selectedCurriculumYear, this.selectedUniqueId).subscribe({
	// 		next: (res) => {
	// 			this.SubjectsTeachtableData = res
	// 			console.log(this.SubjectsTeachtableData)
	// 			// this.subjectCardData = this.SubjectsTeachtableData.map()

	// 		},
	// 		error: (error) => {
	// 			if (error.status === 404) {
	// 				console.error('Not found');
	// 			} else if (error.status === 500) {
	// 				console.error('Internal Server Error');
	// 			} else {
	// 				console.error(
	// 					'An unexpected error occurred:',
	// 					error.status,
	// 				);
	// 			}
	// 		},
	// 	})
	// }

	public getCurriculumsData() {
		this.apiManagementService.GetCurriculum().subscribe({
			next: (res) => {
				this.curriculumsData = res.filter(
					(s) => s.id === 3 || s.id === 5,
				);
				this.curriculumList = this.curriculumsData.map((curriculum) => {
					const dropdown = new DropdownList();
					dropdown.label = `${curriculum.name_th} (${curriculum.year})`;
					dropdown.value = curriculum.id;
					return dropdown;
				});
				this.curriculumOptions = this.curriculumsData.map(
					(curriculum) => {
						const curriculumOptions = new CirriculumnList();
						curriculumOptions.value = curriculum.id;
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

	public handleSelectedYearChange(selectedData: SelectedData) {
		// this.selectedYear = !Number.isNaN(Number(this.getValue(yearsList, selectedData))) ? Number(this.getValue(yearsList, selectedData)) : undefined
		// console.log('Selected Label:', selectedData, 'Year:', this.selectedYear);
		this.selectedYear = selectedData.value;
		console.log('Selected Year:', this.selectedYear);
		this.checkSelectAllDropdown();
	}

	public handleSelectedSemesterChange(selectedData: SelectedData) {
		this.selectedSemester = selectedData.value;
		console.log('Selected Semester:', this.selectedSemester);
		this.checkSelectAllDropdown();
	}

	public handleSelectedClassYearChange(selectedData: SelectedData) {
		this.selectedClassYear = selectedData.value;
		console.log('Selected Class:', this.selectedClassYear);
		this.checkSelectAllDropdown();
	}

	public handleSelectedFacultyChange(selectedData: SelectedData) {
		this.selectedFaculty = selectedData.value;
		console.log('Selected Faculty:', this.selectedFaculty);
		this.checkSelectAllDropdown();
	}

	public handleSelectedDepartmentChange(selectedData: SelectedData) {
		this.selectedDepartment = selectedData.value;
		console.log('Selected Department:', this.selectedDepartment);
		this.checkSelectAllDropdown();
	}

	public handleSelectedCurriculumChange(selectedData: SelectedData) {
		this.selectedCurriculum = selectedData.value;

		const matchedCurriculum = this.curriculumOptions.find(
			(item) => item.value === selectedData.value,
		);
		this.selectedUniqueId = matchedCurriculum.uniqueId;
		this.selectedCurriculumYear = matchedCurriculum.curriculumYear;

		console.log('call get subject');
		// this.getSubjectData()

		this.checkSelectAllDropdown();
	}

	public handleSelectChange(selectName: string, selectedData: SelectedData) {
		// อัปเดตสถานะที่เกี่ยวข้องตาม selectName
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

		// เรียกฟังก์ชันเพื่อตรวจสอบสถานะการเลือกทั้งหมด
		this.checkSelectAllDropdown();

		// ตรวจสอบว่าทุก dropdown ถูกเลือกแล้วหรือยัง
		if (this.isSelectAllDropdown) {
			console.log('All dropdowns selected, calling getSubjectData()');

			// this.getSubjectData();
		}
	}

	// ฟังก์ชันตรวจสอบว่ามีการเลือกค่าทุก dropdown แล้วหรือไม่
	// private allDropdownsSelected(): boolean {
	// 	return (
	// 		this.selectedYear !== undefined &&
	// 		this.selectedSemester !== undefined &&
	// 		this.selectedClassYear !== undefined &&
	// 		this.selectedFaculty !== undefined &&
	// 		this.selectedDepartment !== undefined &&
	// 		this.selectedCurriculum !== undefined
	// 	);
	// }

	public checkSelectAllDropdown() {
		if (
			this.selectedYear &&
			this.selectedSemester &&
			this.selectedClassYear !== undefined &&
			this.selectedFaculty &&
			this.selectedDepartment &&
			this.selectedCurriculum
		) {
			this.isSelectAllDropdown = true;
			this.updatePaginatedItems();
		} else {
			this.isSelectAllDropdown = false;
		}
		console.log('isSelectAllDropdown', this.isSelectAllDropdown);
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
