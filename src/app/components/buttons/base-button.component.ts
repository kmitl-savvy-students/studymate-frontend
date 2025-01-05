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
			[ngClass]="[
				'flex w-full justify-center gap-3 rounded-xl text-base font-semibold',
				textColor,
				textColorHover ? 'hover:' + textColorHover : '',
				backgroundColor,
				backgroundColorHover ? 'hover:' + backgroundColorHover : '',
				backgroundColor || backgroundColorHover ? 'px-4 py-3' : '',
			]"
		>
			<ng-container *ngIf="icon || iconCustom">
				<sdm-icon *ngIf="icon" [icon]="icon"></sdm-icon>
				<ng-container *ngIf="iconCustom">
					<ng-container *ngTemplateOutlet="iconCustom"></ng-container>
				</ng-container>
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
	@Input() textColorHover: string = '';

	@Input() backgroundColor: string = '';
	@Input() backgroundColorHover: string = '';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}
}
