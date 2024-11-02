import { Component, Input } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

@Component({
	selector: 'sdm-confirm-delete-modal',
	standalone: true,
	imports: [IconComponent],
	templateUrl: './confirm-delete-modal.component.html',
	styleUrl: './confirm-delete-modal.component.css',
})
export class SDMConfirmDeleteModalComponent {
	@Input() modalID: string = '';
	@Input() text: string = '';

	deleteTranscriptData() {}
}
