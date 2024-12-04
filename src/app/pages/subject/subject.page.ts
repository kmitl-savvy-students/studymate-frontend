import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMSubjectAddedModalComponent,
		SDMilterBarComponent,
		SDMSubjectComponent,
	],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
	subjects_added = [
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076016',
			name: 'COMPUTER ENGINEERING PROJECT PREPARATION',
			credits: 2,
			isSelected: false,
		},
		{
			code: '01076032',
			name: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
	];
}
