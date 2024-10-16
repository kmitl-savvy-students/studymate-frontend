import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { CommonModule } from '@angular/common';

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
