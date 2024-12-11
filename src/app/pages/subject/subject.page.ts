import { cirriculumList, classList, departmentList, facultyList, semesterList, subjectCardData, subjects_added, yearsList } from './subject-page-data';
import { SelectedData, DropdownList } from './../../shared/models/SdmAppService.model.js';
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

	public selectedYear?: number;
	public selectedSemester: string = '';
	public selectedClass: string = '';
	public selectedFaculty: string = '';
	public selectedDepartment: string = '';
	public selectedCurriculum: string = '';
	public isSelectAllDropdown: boolean = false;
	public selectedData?: SelectedData;

	public currentRoute: string = '';
	public user: User | null = null;
	public isSignIn: boolean = false;

	public yearsList= yearsList
	public semesterList = semesterList;
  	public classList = classList;
  	public facultyList = facultyList;
  	public departmentList = departmentList;
  	public cirriculumList = cirriculumList;

	public subjectCardData = subjectCardData;
	public subjects_added = subjects_added;

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
		this.subjectCardTotal = this.subjectCardData.length;
	}

	public userTokenSubject: Subject<UserToken | null> =
		new Subject<UserToken | null>();

	ngOnInit(): void {
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
		this.updatePaginatedItems();
	}

	ngAfterViewInit(): void {
		initFlowbite();
		this.checkSelectAllDropdown();
	}

	public createLabelsDDL(ddl : DropdownList[]){
		return ddl.map(data => data.label)
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
		this.paginatedItems = this.subjectCardData.slice(start, end);
	}

	public changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	// public getValue(ddlData: DropdownList[], selectedData: SelectedData){
	// 	const matchedItem = ddlData.find(item => item.label === selectedData.label);
	// 	return matchedItem ? matchedItem.value : undefined;
	// }
	
	public handleSelectedYearChange(selectedData: SelectedData) {
		// this.selectedYear = !Number.isNaN(Number(this.getValue(yearsList, selectedData))) ? Number(this.getValue(yearsList, selectedData)) : undefined
		// console.log('Selected Label:', selectedData, 'Year:', this.selectedYear);
		this.selectedYear = selectedData.value
		console.log(selectedData.value)
		this.checkSelectAllDropdown();
	}

	public handleSelectedSemesterChange(selectedSemester: {
		value: string;
		index?: number;
	}) {
		this.selectedSemester = selectedSemester.value;
		console.log('Selected Semester:', this.selectedSemester);
		this.checkSelectAllDropdown();
	}

	public handleSelectedClassChange(selectedClass: {
		value: string;
		index?: number;
	}) {
		this.selectedClass = selectedClass.value;
		console.log('Selected Class:', this.selectedClass);
		this.checkSelectAllDropdown();
	}

	public handleSelectedFacultyChange(selectedFaculty: {
		value: string;
		index?: number;
	}) {
		this.selectedFaculty = selectedFaculty.value;
		console.log('Selected Faculty:', this.selectedFaculty);
		this.checkSelectAllDropdown();
	}

	public handleSelectedDepartmentChange(selectedDepartment: {
		value: string;
		index?: number;
	}) {
		this.selectedDepartment = selectedDepartment.value;
		console.log('Selected Department:', this.selectedDepartment);
		this.checkSelectAllDropdown();
	}

	public handleSelectedCurriculumChange(selectedCurriculum: {
		value: string;
		index?: number;
	}) {
		this.selectedCurriculum = selectedCurriculum.value;
		console.log('Selected Curriculum:', this.selectedCurriculum);
		this.checkSelectAllDropdown();
	}

	public checkSelectAllDropdown() {
		if (
			this.selectedYear &&
			this.selectedSemester &&
			this.selectedClass &&
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
