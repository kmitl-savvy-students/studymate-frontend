import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { HttpClient } from '@angular/common/http';
import { BackendService } from '../../../shared/services/backend.service';
import { AlertService } from '../../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../../shared/services/authentication/authentication.service';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-confirm-delete-modal',
	standalone: true,
	imports: [IconComponent],
	templateUrl: './confirm-delete-modal.component.html',
	styleUrls: ['./confirm-delete-modal.component.css'],
})
export class SDMConfirmDeleteModalComponent implements OnInit, AfterViewInit {
	@Input() modalID: string = '';
	@Input() text: string = '';
	@Input() subtext: string = '';
	userId: string | null = null;

	constructor(
		private http: HttpClient,
		private backendService: BackendService,
		private authService: AuthenticationService,
		private alertService: AlertService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.userId = user?.id ?? null;
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	deleteTranscriptData(): void {
		if (!this.userId) {
			this.alertService.showAlert('error', 'ไม่พบข้อมูลผู้ใช้งาน');
			return;
		}

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/delete/${this.userId}`;

		this.http.delete(apiUrl).subscribe({
			next: () => {
				this.alertService.showAlert('success', 'ลบข้อมูลสำเร็จ!');
				window.location.reload();
			},
			error: (error) => {
				if (error.status === 404) {
					this.alertService.showAlert(
						'warning',
						'ไม่พบข้อมูลที่ต้องการลบ',
					);
				} else {
					this.alertService.showAlert(
						'error',
						'เกิดข้อผิดพลาดในการลบข้อมูล',
					);
					console.error('Error deleting transcript data:', error);
				}
			},
		});
	}
}
