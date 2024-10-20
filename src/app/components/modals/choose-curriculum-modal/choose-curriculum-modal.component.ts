import { Component, Input } from '@angular/core';
import { SDMSelectComponent } from '../../select/select.component';
import { CommonModule } from '@angular/common';

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

	// Mock data for curriculums
	curriculums = [
		{
			id: '0155',
			year: '2565',
			name: 'หลักสูตรวิศวกรรมศาสตร์บัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์ (หลักสูตรนานาชาติ)',
			nameEng:
				'Bachelor of Engineering Program in Computer Engineering (International Program)',
		},
		{
			id: '0105',
			year: '2564',
			name: 'หลักสูตรวิศวกรรมศาสตร์บัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
			nameEng: 'Bachelor of Engineering Program in Computer Engineering',
		},
		{
			id: '0132',
			year: '2564',
			name: 'หลักสูตรวิศวกรรมศาสตร์บัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์ (ภาคปกติ)',
			nameEng: 'Bachelor of Engineering Program in Computer Engineering',
		},
		{
			id: '1182',
			year: '2564',
			name: 'หลักสูตรวิศวกรรมศาสตร์บัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
			nameEng: 'Bachelor of Engineering Program in Computer Engineering',
		},
	];

	// Extract the 'name' field from curriculums for the dropdown
	curriculumOptions: string[] = [];

	ngOnInit(): void {
		// Create an array of names with years from curriculums
		this.curriculumOptions = this.curriculums.map(
			(curriculum) => `${curriculum.name} (${curriculum.year})`,
		);
	}
}
