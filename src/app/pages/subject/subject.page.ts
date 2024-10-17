import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [SDMSelectComponent],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
