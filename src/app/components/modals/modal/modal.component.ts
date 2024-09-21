import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-modal',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './modal.component.html',
	styleUrl: './modal.component.css',
})
export class ModalComponent {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	@Input() courseList: Array<{ code: string; title: string }> = [];
}
