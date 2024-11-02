import { APIManagementService } from '../../../shared/api-manage/api-management.service';
import { Component, Input } from '@angular/core';
import { SDMSelectComponent } from '../../select/select.component';
import { CommonModule } from '@angular/common';
import { Curriculum } from '../../../shared/api-manage/models/Curriculum';
import { SelectedData } from '../../../shared/api-manage/models/app.model';

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
	public curriculumOptions: string[] = [];
	public selectedData: SelectedData[] = [];
	public curriculumId: number = 0;

	constructor(private apiManagementService: APIManagementService) {}

	ngOnInit(): void {
		this.getCurriculumsData();
	}

	getCurriculumsData() {
		this.apiManagementService.GetCurriculum().subscribe({
			next: (res) => {
				this.curriculumsData = res;
				// .filter(
				// 	(s) => s.id === 1 || s.id === 3 || s.id === 5,
				// );
				this.curriculumOptions = this.curriculumsData.map(
					(curriculum) =>
						`${curriculum.name_th} (${curriculum.year})`,
				);
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
		console.log('Selected curriculum in home:', selectedValue.value);
		console.log(
			'Selected curriculum index:',
			selectedValue.index !== -1
				? Number(selectedValue.index) + 1
				: selectedValue.index,
		);
		// this.curriculumId = selectedValue.index
	}

	onSubmitUserCurriculum() {
		// this.apiManagementService.UpdateUserCurriculum().subscribe;
	}
}
