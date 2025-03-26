import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';
import { SDMBaseButton } from './base-button.component';

@Component({
	selector: 'sdm-button-link',
	standalone: true,
	imports: [SDMBaseButton],
	template: `
		<sdm-base-button
			[isUnderlined]="isUnderlined"
			[icon]="icon"
			[iconCustom]="iconCustom"
			[iconEnd]="iconEnd"
			[iconEndCustom]="iconEndCustom"
			[text]="text"
			[textColor]="textColor"
			[textColorHover]="textColorHover"
			[backgroundColor]="backgroundColor"
			[backgroundColorHover]="backgroundColorHover"
			[backgroundColorCustom]="backgroundColorCustom"
			[borderStyle]="borderStyle"
			[borderRadius]="borderRadius"
			[textSize]="textSize"
			[fontWeight]="fontWeight"
			[width]="width"
			[margin]="margin"
			[padding]="padding"
			(clickEvent)="handleClick()">
		</sdm-base-button>
	`,
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
	@Input() textColor: string = 'text-dark-100';
	@Input() textColorHover: string = 'hover:text-main-100';
	@Input() backgroundColor: string = '';
	@Input() backgroundColorHover: string = '';
	@Input() backgroundColorCustom: string = '';
	@Input() borderStyle: string = '';
	@Input() borderRadius: string = 'rounded-xl';
	@Input() textSize: string = 'text-base';
	@Input() fontWeight: string = 'font-semibold';
	@Input() width: string = 'w-full';
	@Input() margin: string = '';
	@Input() padding: string = '';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.loadingService.pulse(() => {
			this.clickEvent.emit();
			this.router.navigate([this.link]);
		});
	}
}
