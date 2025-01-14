import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { initFlowbite } from 'flowbite';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-confirm-modal',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './confirm-modal.component.html',
})
export class SDMConfirmModalComponent implements AfterViewInit {
	@Input() modalID: string = '';

	@Input() icon: string = '';
	@Input() iconColor: string = '';

	@Input() text: string = '';
	@Input() subtext: string = '';
	@Input() textColor: string = '';
	@Input() subtextColor: string = '';

	@Input() backgroundColor: string = '';
	@Input() backgroundColorHover: string = '';

	@Input() confirmFunction!: () => void;

	ngAfterViewInit(): void {
		initFlowbite();
	}

	confirmAction(): void {
		if (this.confirmFunction) {
			this.confirmFunction();
		}
	}
}
