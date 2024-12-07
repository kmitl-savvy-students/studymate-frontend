import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent {
	@Input() subjectName: string = ''; // ชื่อรายวิชา
	@Input() index: number = 0; // ลำดับของ component
}
