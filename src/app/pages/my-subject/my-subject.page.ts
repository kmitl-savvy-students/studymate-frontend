import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { TranscriptData } from '../../shared/models/TranscriptData.model';
import { User } from '../../shared/models/User.model';
import { AlertService } from '../../shared/services/alert/alert.service';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { BackendService } from '../../shared/services/backend.service';
@Component({
	selector: 'sdm-page-my-subject',
	standalone: true,
	imports: [CommonModule, ImportTranscriptComponent],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMPageMySubject implements OnInit, AfterViewInit {
	transcriptData: TranscriptData[] = [];
	curriculumName = '';
	isDataLoaded = false;
	errorMessage: string | null = null;
	currentUser: User | null = null;
	curriculumCategories: any[] = [];
	usedSubjectIds = new Set<string>();

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
			if (!user) {
				this.errorMessage = 'No authenticated user found.';
				this.isDataLoaded = true;
				return;
			}
			const cur = user.curriculum;
			this.curriculumName = cur?.name_th || 'ไม่พบข้อมูลหลักสูตร';
			// this.fetchTranscriptData(user.id);
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	/* TODO: FIX THIS
	fetchTranscriptData(userId: string) {
		const url = `${this.backendService.getBackendUrl()}/api/transcript/get/${userId}`;
		this.http.get<TranscriptData[]>(url).subscribe({
			next: (data) => {
				this.transcriptData = data || [];
				if (this.currentUser?.curriculum) {
					const { unique_id, year } = this.currentUser.curriculum;
					this.loadCategoriesData(unique_id, year);
				} else {
					this.isDataLoaded = true;
				}
			},
			error: () => {
				this.errorMessage = 'ไม่พบข้อมูล Transcript';
				this.isDataLoaded = true;
			},
		});
	}
	*/
}
