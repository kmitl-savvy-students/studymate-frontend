import { AuthService } from '../../../shared/services/auth.service';
import { APIManagementService } from '../../../shared/services/api-management.service';
import { Component, Input } from '@angular/core';
import { SDMSelectComponent } from '../../select/select.component';
import { CommonModule } from '@angular/common';
import { Curriculum } from '../../../shared/models/Curriculum.model';
import { DropdownList, SelectedData } from '../../../shared/models/SdmAppService.model';
import { distinctUntilChanged, filter } from 'rxjs';
import { User } from '../../../shared/models/User.model';
import { Router } from '@angular/router';

@Component({
	selector: 'sdm-choose-curriculum-modal',
	standalone: true,
	imports: [SDMSelectComponent, CommonModule],
	templateUrl: './choose-curriculum-modal.component.html',
	styleUrl: './choose-curriculum-modal.component.css',
})
export class SDMChooseCurriculumModalComponent {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	public curriculumsData: Curriculum[] = [];
	public curriculumOptions: DropdownList[] = [];
	public selectedData: SelectedData[] = [];
	public curriculumId?: number = 0;
	public userTokenId: string | null = '';
	public userId: string | null = '';
	public user: User | null = null;
	public isSignIn = false;

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
		private router: Router,
	) {}

	ngOnInit(): void {
		this.getCurriculumsData();
		this.userTokenId = sessionStorage.getItem('userTokenId');
		this.authService.userTokenSubject
			.pipe(
				filter((token) => token !== null),
				distinctUntilChanged(),
			)
			.subscribe((userToken) => {
				let user = userToken.user;
				this.userId = user.id;
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
	}

	getCurriculumsData() {
		this.apiManagementService.GetCurriculum().subscribe({
			next: (res) => {
				this.curriculumsData = res;
				// .filter(
				// 	(s) => s.id === 1 || s.id === 3 || s.id === 5,
				// );
				this.curriculumOptions = this.curriculumsData.map(
					(curriculum) => {
						const dropdown = new DropdownList();
						dropdown.label = `${curriculum.name_th} (${curriculum.year})`;
						dropdown.value = curriculum.id;
						return dropdown;
					}
				);
				console.log(this.curriculumOptions)
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

	handleSelectedValueChange(selectedValue: SelectedData) {
		console.log('Selected curriculum in home:', selectedValue.label);
		console.log('Selected curriculum index:', selectedValue.value)
		this.curriculumId = selectedValue.value
	}

	onSubmitUserCurriculum() {
		if (this.curriculumId === -1) {
			alert('Please Select Curriculum First');
			window.location.reload();
		} else {
			this.apiManagementService
				.UpdateUserCurriculum(
					this.userTokenId!,
					this.user?.id,
					this.curriculumId,
				)
				.subscribe({
					next: (res) => {
						this.authService.setCurriculumSelected(true);
						const modal = document.getElementById(this.modalID);
						if (modal) {
							modal.classList.remove('show');
							modal.classList.add('hidden');
						}
					},
					error: (error) => {
						console.log(error);
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
	}
}
