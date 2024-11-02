import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { AuthService } from '../../../shared/auth.service';
import { APIManagementService } from '../../../shared/api-manage/api-management.service';

@Component({
	selector: 'sdm-import-transcript-modal',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './import-transcript-modal.component.html',
	styleUrl: './import-transcript-modal.component.css',
})
export class ImportTranscriptComponent {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	selectedFileName: string = '';
	errorMessage: string = '';
	isSubmitDisabled: boolean = true;

	@ViewChild('fileInput') fileInput!: ElementRef;

	constructor(
		private authService: AuthService,
		private apiManagementService: APIManagementService,
	) {}

	isUploading: boolean = false;
	uploadComplete: boolean = false;
	statusMessage: string = '';

	onFileSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			if (file.type === 'application/pdf') {
				const fileSizeInMB = file.size / (1024 * 1024);
				if (fileSizeInMB <= 15) {
					this.selectedFileName = file.name;
					this.errorMessage = '';
					this.isSubmitDisabled = false;
					this.uploadComplete = false;
				} else {
					this.selectedFileName = '';
					this.errorMessage = 'ขนาดไฟล์ต้องไม่เกิน 15 MB';
					this.isSubmitDisabled = true;
				}
			} else {
				this.selectedFileName = '';
				this.errorMessage = 'อัปโหลดได้เฉพาะไฟล์ PDF เท่านั้น';
				this.isSubmitDisabled = true;
			}
		}
	}

	uploadFile() {
		if (!this.selectedFileName) {
			return;
		}

		const file: File = this.fileInput.nativeElement.files[0];
		if (file) {
			console.log('Uploading file:', file.name);
			this.isUploading = true;

			this.authService.getToken().subscribe((userToken) => {
				this.apiManagementService
					.UpdateUserTranscriptByUpload(
						userToken?.user?.id ?? '',
						userToken?.id ?? '',
						file,
					)
					.subscribe({
						next: (event) => {
							if (event.type === HttpEventType.Response) {
								this.statusMessage = 'การอัปโหลดเสร็จสมบูรณ์';
								this.uploadComplete = true;
								this.clearFile();

								this.isUploading = false;

								setTimeout(() => {
									this.uploadComplete = false;
									this.statusMessage = '';
								}, 5000);
							}
						},
						error: (error) => {
							console.error('Upload failed', error);
							this.errorMessage =
								'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
							this.isUploading = false;
							this.isSubmitDisabled = false;
						},
					});
			});
		}
	}

	clearFile() {
		this.selectedFileName = '';
		this.errorMessage = '';
		this.fileInput.nativeElement.value = '';
		this.isSubmitDisabled = true;
	}

	onDivClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
	}
}
