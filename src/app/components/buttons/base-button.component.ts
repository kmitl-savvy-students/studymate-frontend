import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-base-button',
	standalone: true,
	template: `
		<button
			[type]="isSubmit ? 'submit' : 'button'"
			[disabled]="IsDisabled"
			(click)="handleClick()"
			class="
				w-full justify-center rounded-xl flex gap-3
				px-4 py-3
				text-base font-semibold
				{{ textColor }} hover:{{ textColorHover }}
				{{ backgroundColor }} hover:{{ backgroundColorHover }}
			"
		>
			<sdm-icon *ngIf="icon" [icon]="icon" />
			<ng-container *ngIf="iconCustom">
				<ng-container *ngTemplateOutlet="iconCustom" />
			</ng-container>
			<span>{{ text }}</span>
		</button>
	`,
	imports: [IconComponent, CommonModule],
})
export class SDMBaseButton {
	@Input() text: string = 'Empty text';
	@Input() icon: string = '';
	@Input() iconCustom: any | null = null;

	@Input() IsDisabled: boolean = false;
	@Input() isSubmit: boolean = false;

	@Input() textColor: string = 'text-dark-100';
	@Input() textColorHover: string = 'text-dark-100';

	@Input() backgroundColor: string = 'bg-main-5';
	@Input() backgroundColorHover: string = 'bg-main-10';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}
}
