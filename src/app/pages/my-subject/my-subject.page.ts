import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SDMConfirmDeleteModalComponent } from '../../components/modals/delete-modal/confirm-delete-modal.component';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../shared/services/alert/alert.service';
import { TranscriptData } from '../../shared/models/TranscriptData.model';
import { User } from '../../shared/models/User.model';
import { BackendService } from '../../shared/services/backend.service';
import { initFlowbite } from 'flowbite';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		CommonModule,
		SDMConfirmDeleteModalComponent,
		ImportTranscriptComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMMySubject implements OnInit, AfterViewInit {
	public transcriptData: TranscriptData[] = [];
	public curriculumName: string = '';
	public isDataLoaded: boolean = false;
	public errorMessage: string | null = null;
	currentUser: User | null = null;

	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
	) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;

			if (!this.currentUser) {
				this.errorMessage = 'No authenticated user found.';
				this.isDataLoaded = true;
				return;
			}

			const curriculum = this.currentUser.curriculum;
			this.curriculumName = curriculum?.name_th || 'ไม่พบข้อมูลหลักสูตร';

			this.fetchTranscriptData(this.currentUser.id);
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	private fetchTranscriptData(userId: string): void {
		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get/${userId}`;

		this.http.get<TranscriptData[]>(apiUrl).subscribe({
			next: (res: TranscriptData[]) => {
				this.transcriptData = res;
				this.isDataLoaded = true;
			},
			error: (error) => {
				console.error('Error fetching transcript data:', error);
				this.errorMessage = 'ไม่พบข้อมูล Transcript';
				this.isDataLoaded = true;
			},
		});
	}

	/**
	 * Group transcript data by year and semester.
	 * If year or semester is missing, defaults to -1.
	 */
	groupByYearSemester(
		data: TranscriptData[],
	): { year: number; semester: number; subjects: TranscriptData[] }[] {
		const map = new Map<string, TranscriptData[]>();

		for (const item of data) {
			const y = item.year ?? -1;
			const s = item.semester ?? -1;
			const key = `${y}-${s}`;
			if (!map.has(key)) {
				map.set(key, []);
			}
			map.get(key)?.push(item);
		}

		return Array.from(map.entries()).map(([key, subjects]) => {
			const [year, semester] = key.split('-').map((x) => parseInt(x, 10));
			return { year, semester, subjects };
		});
	}

	/**
	 * Calculate total credits for courses where grade is not 'X'.
	 */
	calculateTotalCreditsNonX(): number {
		return this.transcriptData
			.filter((d) => d.grade !== 'X')
			.reduce((sum, d) => sum + (d.credit ?? 0), 0);
	}
}
