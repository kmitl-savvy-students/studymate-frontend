import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMButtonLink } from '../../components/buttons/link/button-link.component';
import { IconComponent } from '../../components/icon/icon.component';
import { RouterLink } from '@angular/router';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';

@Component({
	selector: 'sdm-subject-detail',
	standalone: true,
	imports: [IconComponent, RouterLink, SDMSubjectDetailCpnComponent],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMSubjectDetail implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
