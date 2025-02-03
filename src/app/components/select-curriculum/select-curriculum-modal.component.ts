import { Component, OnInit } from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { IconComponent } from '../icon/icon.component';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { User } from '../../shared/models/User.model';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../shared/services/alert/alert.service';
import { BackendService } from '../../shared/services/backend.service';

@Component({
	selector: 'modal-select-curriculum',
	standalone: true,
	templateUrl: 'select-curriculum-modal.html',
	imports: [SDMBaseButton, IconComponent],
})
export class SelectCurriculumModalComponent implements OnInit {
	modal: ModalInterface | undefined;
	currentUser: User | null = null;
	selectedCurriculumId: number | null = null;

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private alertService: AlertService,
		private backendService: BackendService,
	) {}

	ngOnInit(): void {
		const $modal = document.getElementById('curriculumModal');
		const options: ModalOptions = {
			backdrop: 'static',
			closable: false,
		};
		this.modal = new Modal($modal, options);

		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			this.handleModalVisibility();
		});
	}

	handleModalVisibility() {
		if (this.currentUser == null) {
			return;
		}
		if (this.currentUser.curriculum == null) {
			//this.modal?.show();
		}
	}

	selectCurriculum(): void {
		if (this.selectedCurriculumId == null) {
			this.alertService.showAlert('error', 'กรุณาเลือกหลักสูตรก่อน');
			return;
		}

		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update`;
		const body = {
			id: this.currentUser?.id,
			curriculum_id: this.selectedCurriculumId,
		};

		this.http.patch(apiUrl, body).subscribe({
			next: () => {
				this.alertService.showAlert('success', 'เลือกหลักสูตรสำเร็จ!');
				location.reload();
			},
			error: (error) => {
				console.error('Error updating curriculum:', error);
				this.alertService.showAlert(
					'error',
					'ไม่สามารถเลือกหลักสูตรได้ กรุณาลองอีกครั้ง',
				);
			},
		});
	}
}
