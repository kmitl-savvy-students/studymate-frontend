import { AfterViewInit, Component } from '@angular/core';

import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-page-home',
	standalone: true,
	imports: [],
	templateUrl: './page-not-found.page.html',
})
export class SDMPageNotFound implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
