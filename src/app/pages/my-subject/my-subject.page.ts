import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { Tabs } from '@models/Tabs.model.js';
import { Transcript } from '@models/Transcript.model';
import { TranscriptDetail } from '@models/TranscriptDetail.model';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';
import { SDMAdviceDashboardComponent } from '../../components/advice-dashboard/advice-dashboard.component';
import { SDMCreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMBaseModal } from '../../components/modals/base-modal.component';
import { SDMProgressTracker } from '../../components/progress-tracker/progress-tracker.component';
import { SDMTabsComponent } from '../../components/tabs/tabs.component';
import { SDMTranscriptTrackerComponent } from '../../components/transcript-tracker/transcript-tracker.component';

@Component({
	selector: 'sdm-page-my-subject',
	standalone: true,
	imports: [CommonModule, SDMBaseButton, SDMBaseModal, IconComponent, SDMCreditDashboardComponent, SDMAdviceDashboardComponent, SDMTabsComponent, SDMProgressTracker, SDMTranscriptTrackerComponent],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMPageMySubject implements OnInit {
	@ViewChild('uploadTranscriptModal') uploadTranscriptModal!: SDMBaseModal;
	@ViewChild('deleteTranscriptModal') deleteTranscriptModal!: SDMBaseModal;

	@ViewChild('transcript', { static: true }) transcriptTemplate!: TemplateRef<Tabs>;
	@ViewChild('progress', { static: true }) progressTemplate!: TemplateRef<Tabs>;
	@ViewChild('grade', { static: true }) gradeTemplate!: TemplateRef<Tabs>;

	public currentUser: User | null = null;
	public transcriptData: Transcript | null = null;
	public groupedTranscriptDetails: { year: number; term: number; details: Array<TranscriptDetail> }[] = [];

	public isFetchingTranscriptDetails: boolean = false;

	public totalCompletedCredit: number = 0;

	public tabs: Tabs[] = [
		{ id: 'transcript', icon: 'file', tab_name: 'ข้อมูลรายวิชาตามทรานสคริปต์' },
		{ id: 'progress', icon: 'book-bookmark', tab_name: 'ข้อมูลรายวิชาตามโครงสร้างหลักสูตร' },
		{ id: 'grade', icon: 'graduation-cap', tab_name: 'เกรด' },
	];

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
		this.fetchTranscripts();
		console.log(this.transcriptData);
		console.log(this.isFetchingTranscriptDetails);
	}

	// #region Fetchings Transcript
	fetchTranscripts() {
		if (!this.currentUser) return;

		this.isFetchingTranscriptDetails = true;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get-by-user/${this.currentUser.id}`;
		this.http
			.get<Transcript>(apiUrl)
			.pipe(
				finalize(() => {
					this.loadingService.hide();
					this.isFetchingTranscriptDetails = false;
				}),
			)
			.subscribe({
				next: (data) => {
					this.transcriptData = data;
					if (data !== null) {
						this.prepareAndSortTranscriptDetails(data.details);
					}
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
				},
			});
	}

	prepareAndSortTranscriptDetails(data: Array<TranscriptDetail>) {
		if (!this.transcriptData) return;
		console.log('data:', data);
		this.transcriptData.details = data.sort((a, b) => {
			if (b.teachtable?.year !== a.teachtable?.year) {
				return (a.teachtable?.year ?? 0) - (b.teachtable?.year ?? 0);
			}
			if (b.teachtable?.term !== a.teachtable?.term) {
				return (a.teachtable?.term ?? 0) - (b.teachtable?.term ?? 0);
			}
			return a.subject?.id.localeCompare(b.subject?.id ?? '') ?? 0;
		});
		this.groupedTranscriptDetails = [];
		this.transcriptData.details.forEach((transcriptDetails) => {
			let group = this.groupedTranscriptDetails.find((g) => g.year === (transcriptDetails.teachtable?.year ?? 0) && g.term === (transcriptDetails.teachtable?.term ?? 0));
			if (!group) {
				group = { year: transcriptDetails.teachtable?.year ?? 0, term: transcriptDetails.teachtable?.term ?? 0, details: [] };
				this.groupedTranscriptDetails.push(group);
			}
			group.details.push(transcriptDetails);
		});
		console.log('groupedTranscriptDetails:', this.groupedTranscriptDetails);
	}

	calculateTotalCompletedCredit(groupedTranscriptDetails: Array<TranscriptDetail>): void {
		this.totalCompletedCredit = groupedTranscriptDetails.reduce((sum, detail) => {
			return sum + (detail.subject?.credit || 0);
		}, 0);
	}

	// #endregion
	// #region Delete Transcript
	onDeleteTranscript() {
		this.deleteTranscriptModal.show();
	}

	onConfirmDeleteTranscript() {
		this.deleteTranscriptModal.hide();

		if (!this.currentUser) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/delete/${this.currentUser.id}`;

		this.loadingService.show(() => {
			this.http
				.delete(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: () => {
						this.alertService.showAlert('success', 'ลบข้อมูล Transcript เสร็จสมบูรณ์');
						this.fetchTranscripts();
					},
					error: (error) => {
						console.error('Error delete transcript:', error);
					},
				});
		});
	}

	// #endregion
	// #region Upload Transcript
	onUploadTranscript() {
		this.uploadTranscriptModal.show();
	}

	onConfirmUploadTranscript() {
		this.alertService.showAlert('error', 'กรุณาเลือกไฟล์เพื่ออัปโหลด Transcript');
	}

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
							this.fetchTranscripts();
						},
						error: (error) => {
							console.error('Error upload transcript:', error);
						},
					});
			});
		}
	}
	// #endregion
}
