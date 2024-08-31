import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({

	selector: 'app-button',
	standalone: true,
	templateUrl: './button.component.html',
})
export class ButtonComponent {
	@Input() text: string = '';
	@Output() clickEvent = new EventEmitter<void>();

	handleClick() {
		this.clickEvent.emit();
	}
}
