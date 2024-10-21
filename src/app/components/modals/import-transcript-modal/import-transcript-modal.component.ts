import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { CommonModule } from '@angular/common';
import { TranscriptUploadService } from '../../../shared/transcript-upload.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';

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

	constructor(private uploadService: TranscriptUploadService) {}

	// New properties for upload state
	uploadProgress: number = 0;
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
					this.uploadComplete = false; // Reset uploadComplete
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
			this.uploadProgress = 0;
			this.uploadService.uploadTranscript(file).subscribe(
				(event: HttpEvent<any>) => {
					switch (event.type) {
						case HttpEventType.Sent:
							console.log('Upload started');
							break;
						case HttpEventType.UploadProgress:
							if (event.total) {
								this.uploadProgress = Math.round(
									(100 * event.loaded) / event.total,
								);
								console.log(
									`Upload progress: ${this.uploadProgress}%`,
								);
							}
							break;
						case HttpEventType.Response:
							console.log(
								'Upload completed successfully',
								event.body,
							);
							this.isUploading = false;
							this.uploadComplete = true;
							this.statusMessage = 'การอัปโหลดเสร็จสมบูรณ์';
							this.clearFile();
							break;
					}
				},
				(error) => {
					console.error('Upload failed', error);
					this.errorMessage =
						'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
					this.isUploading = false;
					this.isSubmitDisabled = false;
				},
			);
		}
	}

	clearFile() {
		this.selectedFileName = '';
		this.errorMessage = '';
		this.fileInput.nativeElement.value = '';
		this.isSubmitDisabled = true;
		this.uploadProgress = 0;
		this.uploadComplete = false;
		this.statusMessage = '';
	}

	onDivClick(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
	}
}
