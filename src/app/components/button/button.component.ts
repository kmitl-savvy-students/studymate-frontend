import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-button',

	templateUrl: './button.component.html',
})
export class ButtonComponent {
	@Input() text: string = '';
	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}
}
