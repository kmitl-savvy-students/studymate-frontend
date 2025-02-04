import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { AlertService } from '../../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';
import { BackendService } from '../../../shared/services/backend.service';
import { IconComponent } from '../../icon/icon.component';

@Component({
	selector: 'sdm-import-transcript-modal',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './import-transcript-modal.component.html',
	styleUrls: ['./import-transcript-modal.component.css'],
})
export class ImportTranscriptComponent implements AfterViewInit {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	selectedFileName: string = '';
	errorMessage: string = '';
	isSubmitDisabled: boolean = true;

	@ViewChild('fileInput') fileInput!: ElementRef;

	isUploading: boolean = false;
	uploadComplete: boolean = false;
	statusMessage: string = '';

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private alertService: AlertService,
		private backendService: BackendService,
	) {}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	onFileSelected(event: any): void {
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
					this.resetFileSelection('ขนาดไฟล์ต้องไม่เกิน 15 MB');
				}
			} else {
				this.resetFileSelection('อัปโหลดได้เฉพาะไฟล์ PDF เท่านั้น');
			}
		}
	}

	uploadFile(): void {
		if (!this.selectedFileName) {
			return;
		}

		const file: File = this.fileInput.nativeElement.files[0];
		if (file) {
			this.isUploading = true;

			this.authService.user$.subscribe((user) => {
				if (!user) {
					this.alertService.showAlert('error', 'ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง');
					this.isUploading = false;
					return;
				}

				const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/upload`;
				const formData: FormData = new FormData();
				formData.append('id', user.id.toString());
				formData.append('file', file);

				this.http
					.post(apiUrl, formData, {
						reportProgress: true,
						observe: 'events',
					})
					.subscribe({
						next: (event) => {
							if (event.type === HttpEventType.Response) {
								this.statusMessage = 'การอัปโหลดเสร็จสมบูรณ์';
								this.uploadComplete = true;
								this.clearFile();
								this.isUploading = false;
								setTimeout(() => {
									this.uploadComplete = false;
									window.location.reload();
								}, 500);
							}
						},
						error: (error) => {
							console.error('Upload failed', error);
							this.errorMessage = 'การอัปโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง';
							this.isUploading = false;
							this.isSubmitDisabled = false;
						},
					});
			});
		}
	}

	clearFile(): void {
		this.selectedFileName = '';
		this.errorMessage = '';
		this.fileInput.nativeElement.value = '';
		this.isSubmitDisabled = true;
	}

	private resetFileSelection(message: string): void {
		this.selectedFileName = '';
		this.errorMessage = message;
		this.isSubmitDisabled = true;
	}

	onDivClick(event: MouseEvent): void {
		event.stopPropagation();
		event.preventDefault();
	}
}
