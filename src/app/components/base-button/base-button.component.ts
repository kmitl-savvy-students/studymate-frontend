import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'sdm-base-button',
	standalone: true,
	template: `
		<button
			(click)="handleClick()"
			class="w-full justify-center rounded-xl px-4 py-3 text-base font-semibold {{
				textColor
			}} {{ backgroundColor }} hover:{{ backgroundColorHover }}"
		>
			{{ text }}
		</button>
	`,
})
export class SDMBaseButton {
	@Input() text: string = 'Empty text';

	@Input() textColor: string = 'text-dark-100';

	@Input() backgroundColor: string = '';
	@Input() backgroundColorHover: string = '';

	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}
}
