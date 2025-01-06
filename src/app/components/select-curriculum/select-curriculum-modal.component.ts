import { Component, OnInit } from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { IconComponent } from '../icon/icon.component';
import { Modal, ModalInterface } from 'flowbite';

@Component({
	selector: 'modal-select-curriculum',
	standalone: true,
	templateUrl: 'select-curriculum-modal.html',
	imports: [SDMBaseButton, IconComponent],
})
export class SelectCurriculumModalComponent implements OnInit {
	modal: ModalInterface | undefined;

	ngOnInit(): void {
		const $modal = document.getElementById('curriculumModal');
		this.modal = new Modal($modal);
		// this.modal.show();
	}
}
