import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-base-button',
	standalone: true,
	template: `
		<button
			[id]="buttonId"
			[type]="isSubmit ? 'submit' : 'button'"
			[disabled]="isDisabled"
			(click)="handleClick()"
			[ngClass]="[
				'flex w-full items-center justify-center gap-3 rounded-xl text-base font-semibold',
				textColor,
				textColorHover ? 'hover:' + textColorHover : '',
				backgroundColor,
				backgroundColorHover ? 'hover:' + backgroundColorHover : '',
				backgroundColor || backgroundColorHover ? 'px-4 py-3' : '',
				isUnderlined ? 'underline decoration-1' : '',
			]"
			[attr.data-dropdown-toggle]="dropdownToggle ? dropdownToggle : null"
			[attr.data-dropdown-offset-distance]="dropdownToggle ? '15' : null"
		>
			<ng-container *ngIf="icon || iconCustom">
				<sdm-icon *ngIf="icon" [icon]="icon"></sdm-icon>
				<ng-container *ngIf="iconCustom">
					<ng-container *ngTemplateOutlet="iconCustom"></ng-container>
				</ng-container>
			</ng-container>
			<span>{{ text }}</span>
			<ng-container *ngIf="iconEnd || iconEndCustom">
				<sdm-icon *ngIf="iconEnd" [icon]="iconEnd"></sdm-icon>
				<ng-container *ngIf="iconEndCustom">
					<ng-container
						*ngTemplateOutlet="iconEndCustom"
					></ng-container>
				</ng-container>
			</ng-container>
		</button>
	`,
	imports: [IconComponent, CommonModule],
})
export class SDMBaseButton {
	@Input() buttonId: string = '';

	@Input() text: string = 'Empty text';
	@Input() icon: string = '';
	@Input() iconCustom: any | null = null;
	@Input() iconEnd: string = '';
	@Input() iconEndCustom: any | null = null;

	@Input() dropdownToggle: string = '';

	@Input() isDisabled: boolean = false;
	@Input() isUnderlined: boolean = false;
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
