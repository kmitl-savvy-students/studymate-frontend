import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/auth.service';
import { APIManagementService } from '../../shared/api-manage/api-management.service';
import { TranscriptData } from '../../shared/api-manage/models/TranscriptData.model';
import { SDMConfirmDeleteModalComponent } from '../../components/modals/delete-modal/confirm-delete-modal.component';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';

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
export class SDMMySubject implements OnInit {
	public transcriptData: TranscriptData[] = [];
	public curriculumName: string = '';
	public isDataLoaded: boolean = false;
	public errorMessage: string | null = null;

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}

	ngOnInit(): void {
		this.authService.getToken().subscribe({
			next: (userToken) => {
				if (!userToken) {
					this.errorMessage = 'No user token found.';
					this.isDataLoaded = true;
					return;
				}

				const userTokenId = userToken.id;
				const userId = userToken.user.id;
				const curriculum = userToken.user.curriculum;

				this.curriculumName =
					curriculum?.name_th || 'ไม่พบข้อมูลหลักสูตร';

				console.log('Fetching transcript data...');
				this.apiManagementService
					.GetTranscriptData(userTokenId, userId)
					.subscribe({
						next: (res: TranscriptData[]) => {
							console.log('Transcript data fetched:', res);
							this.transcriptData = res;
							this.isDataLoaded = true;
						},
						error: (error) => {
							console.error(
								'Error fetching transcript data:',
								error,
							);
							this.errorMessage =
								'Error fetching transcript data.';
							this.isDataLoaded = true;
						},
					});
			},
			error: (error) => {
				console.error('Error fetching user token:', error);
				this.errorMessage = 'Error fetching user token.';
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
