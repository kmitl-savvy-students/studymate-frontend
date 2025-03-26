import { Injectable } from '@angular/core';
import { SelectCurriculumModalComponent } from '@components/select-curriculum/select-curriculum-modal.component';

@Injectable({ providedIn: 'root' })
export class SelectCurriculumModalService {
	private modalRef: SelectCurriculumModalComponent | null = null;

	registerModal(modalCmp: SelectCurriculumModalComponent) {
		this.modalRef = modalCmp;
	}

	cancelable() {
		if (this.modalRef != null) this.modalRef.isCancelable = true;
	}

	open() {
		this.modalRef?.toggleModalVisibility(true);
	}

	close() {
		this.modalRef?.toggleModalVisibility(false);
	}
}
