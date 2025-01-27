import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'sdm-my-subject-modal',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './my-subject-modal.component.html',
	styleUrl: './my-subject-modal.component.css',
})
export class ModalComponent {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	@Input() courseList: Array<{ code: string; title: string }> = [];
}
