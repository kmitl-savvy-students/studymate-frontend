import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-base-button',
	standalone: true,
	template: `
		<button
			[id]="buttonId"
			[type]="isSubmit ? 'submit' : 'button'"
			[disabled]="isDisabled"
			(click)="handleClick()"
			[ngClass]="getButtonClasses()"
			[attr.data-dropdown-toggle]="dropdownToggle ? dropdownToggle : null"
			[attr.data-dropdown-offset-distance]="dropdownToggle ? '15' : null"
			[ngStyle]="{ 'background-color': backgroundColorCustom }">
			<ng-container *ngIf="icon || iconCustom">
				<sdm-icon *ngIf="icon" [icon]="icon"></sdm-icon>
				<ng-container *ngIf="iconCustom">
					<ng-container *ngTemplateOutlet="iconCustom"></ng-container>
				</ng-container>
			</ng-container>
			<span *ngIf="text">{{ text }}</span>
			<ng-container *ngIf="iconEnd || iconEndCustom">
				<sdm-icon *ngIf="iconEnd" [icon]="iconEnd"></sdm-icon>
				<ng-container *ngIf="iconEndCustom">
					<ng-container *ngTemplateOutlet="iconEndCustom"></ng-container>
				</ng-container>
			</ng-container>
		</button>
	`,
	imports: [IconComponent, CommonModule],
})
export class SDMBaseButton {
	@Input() buttonId: string = '';
	@Input() text: string = '';
	@Input() icon: string = '';
	@Input() iconCustom: any | null = null;
	@Input() iconEnd: string = '';
	@Input() iconEndCustom: any | null = null;
	@Input() dropdownToggle: string = '';
	@Input() isDisabled: boolean = false;
	@Input() isUnderlined: boolean = false;
	@Input() isSubmit: boolean = false;
	@Input() textColor: string = 'text-dark';
	@Input() textColorHover: string = 'hover:text-primary-300';
	@Input() backgroundColor: string = '';
	@Input() backgroundColorCustom: string = '';
	@Input() backgroundColorHover: string = '';
	@Input() backgroundColorHoverCustom: string = '';
	@Input() cursor: string = '';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}

	getButtonClasses(): string {
		const classes = ['transition-all', 'flex', 'w-full', 'items-center', 'justify-center', 'gap-3', 'rounded-xl', 'text-base', 'font-semibold'];

		if (this.textColor) classes.push(this.textColor);
		if (this.textColorHover) classes.push(this.textColorHover);
		if (this.backgroundColor) classes.push(this.backgroundColor);
		if (this.backgroundColorHover && !this.isDisabled) classes.push(this.backgroundColorHover);
		if (this.backgroundColor || this.backgroundColorHover) classes.push('px-4', 'py-3');
		if (this.isUnderlined) classes.push('underline', 'decoration-1');

		if (this.isDisabled) classes.push('opacity-50', 'cursor-not-allowed');
		if (this.cursor) classes.push(this.cursor);

		return classes.join(' ');
	}
}
