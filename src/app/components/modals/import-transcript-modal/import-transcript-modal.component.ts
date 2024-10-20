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

	onFileSelected(event: any) {
		const file: File = event.target.files[0];
		if (file) {
			if (file.type === 'application/pdf') {
				const fileSizeInMB = file.size / (1024 * 1024);
				if (fileSizeInMB <= 15) {
					this.selectedFileName = file.name;
					this.errorMessage = '';
					this.isSubmitDisabled = false;
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
			this.uploadService.uploadTranscript(file).subscribe(
				(event: HttpEvent<any>) => {
					switch (event.type) {
						case HttpEventType.Sent:
							console.log('Upload started');
							break;
						case HttpEventType.UploadProgress:
							if (event.total) {
								console.log(
									`Upload progress: ${(100 * event.loaded) / event.total}%`,
								);
							}
							break;
						case HttpEventType.Response:
							console.log(
								'Upload completed successfully',
								event.body,
							);
							this.clearFile();
							break;
					}
				},
				(error) => {
					console.error('Upload failed', error);
					this.errorMessage =
						'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
				},
			);
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
