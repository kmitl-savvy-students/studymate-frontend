import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-accordion',
	templateUrl: './accordion.component.html',
	styleUrls: ['./accordion.component.css'],
})
export class SDMAccordionComponent implements AfterViewInit, OnInit {
	@Input() header: string = '';
	@Input() subHeader: string = '';
	@Input() accordionId: string = '';
	@Input() accordionDefaultStatus: boolean = false;
	public isExpanded: boolean = false;

	ngOnInit(): void {
		this.isExpanded = this.accordionDefaultStatus;
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			initFlowbite();
		}, 0);
	}
}
