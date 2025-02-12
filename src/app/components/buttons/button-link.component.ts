import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';
import { SDMBaseButton } from './base-button.component';

@Component({
	selector: 'sdm-button-link',
	standalone: true,
	imports: [SDMBaseButton],
	template: ` <sdm-base-button [isUnderlined]="isUnderlined" [icon]="icon" [iconCustom]="iconCustom" [iconEnd]="iconEnd" [iconEndCustom]="iconEndCustom" [text]="text" [textColor]="textColor" [textColorHover]="textColorHover" [backgroundColor]="backgroundColor" [backgroundColorHover]="backgroundColorHover" (clickEvent)="handleClick()"> </sdm-base-button> `,
})
export class SDMButtonLink {
	constructor(
		private loadingService: LoadingService,
		private router: Router,
	) {}

	@Input() link: string = '/';

	@Input() isUnderlined: boolean = false;

	@Input() text: string = 'Empty text';
	@Input() icon: string = '';
	@Input() iconCustom: any | null = null;
	@Input() iconEnd: string = '';
	@Input() iconEndCustom: any | null = null;

	@Input() textColor: string = 'text-dark';
	@Input() textColorHover: string = 'hover:text-primary-300';

	@Input() backgroundColor: string = '';
	@Input() backgroundColorHover: string = '';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.loadingService.pulse(() => {
			this.clickEvent.emit();
			this.router.navigate([this.link]);
		});
	}
}
