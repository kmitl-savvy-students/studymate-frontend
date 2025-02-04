import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMBaseModal } from '../../components/modals/base-modal.component';

@Component({
	selector: 'sdm-page-my-subject',
	standalone: true,
	imports: [CommonModule, SDMBaseButton, SDMBaseModal, IconComponent],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMPageMySubject implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {}

	currentUser: User | null = null;

	@ViewChild('uploadTranscriptModal') uploadTranscriptModal!: SDMBaseModal;

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
	}

	onUploadTranscript() {
		this.uploadTranscriptModal.show();
	}
	onConfirmUploadTranscript() {}

	onDeleteTranscript() {}

	onTranscriptUploadInput(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			if (file.type === 'application/pdf') {
				const fileSizeInMB = file.size / (1024 * 1024);
				if (fileSizeInMB <= 15) {
					this.uploadTranscript(event.target.files[0]);
					this.uploadTranscriptModal.hide();
				} else {
					this.alertService.showAlert('error', 'ขนาดไฟล์ต้องไม่เกิน 15 MB');
				}
			} else {
				this.alertService.showAlert('error', 'กรุณาอัปโหลดเฉพาะไฟล์ PDF เท่านั้น');
			}
			event.target.value = '';
		}
	}
	uploadTranscript(file: File) {
		if (file) {
			if (!this.currentUser) return;

			const formData: FormData = new FormData();
			formData.append('id', this.currentUser.id.toString());
			formData.append('file', file);

			const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/upload`;

			this.loadingService.show(() => {
				this.http
					.post(apiUrl, formData)
					.pipe(
						finalize(() => {
							this.loadingService.hide();
						}),
					)
					.subscribe({
						next: () => {
							this.alertService.showAlert('success', 'อัปโหลดไฟล์เสร็จสมบูรณ์');
						},
						error: (error) => {
							console.error('Error upload transcript:', error);
						},
					});
			});
		}
	}
}
