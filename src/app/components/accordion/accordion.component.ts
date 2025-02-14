import { AfterViewInit, Component, Input } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-accordion',
	imports: [],
	templateUrl: './accordion.component.html',
	styleUrl: './accordion.component.css',
})
export class SDMAccordionComponent implements AfterViewInit {
	@Input() header: string = '';
	@Input() subHeader: string = '';
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
