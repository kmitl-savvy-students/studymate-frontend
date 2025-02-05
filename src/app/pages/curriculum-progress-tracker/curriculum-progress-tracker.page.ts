import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SDMBaseButton } from '@components/buttons/base-button.component';
import { SDMButtonLink } from '@components/buttons/button-link.component';
import { IconComponent } from '@components/icon/icon.component';
import { SDMBaseModal } from '@components/modals/base-modal.component';
import { Curriculum } from '@models/Curriculum.model';
import { Transcript } from '@models/Transcript.model';
import { User } from '@models/User.model';
import { AlertService } from '@services/alert/alert.service';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { BackendService } from '@services/backend.service';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

@Component({
	selector: 'sdm-page-curriculum-progress-tracker',
	standalone: true,
	imports: [CommonModule, SDMBaseButton, SDMBaseModal, IconComponent, SDMButtonLink],
	templateUrl: 'curriculum-progress-tracker.page.html',
})
export class SDMPageCurriculumProgressTracker implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private http: HttpClient,
		private backendService: BackendService,
		private alertService: AlertService,
		private loadingService: LoadingService,
	) {}

	currentUser: User | null = null;

	transcript: Transcript | null = null;
	curriculum: Curriculum | null = null;

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
		this.fetchTranscripts();
		this.fetchCurriculum();
	}

	private openAccordions: Set<number> = new Set();
	toggleAccordion(groupId: number) {
		if (this.openAccordions.has(groupId)) {
			this.openAccordions.delete(groupId);
		} else {
			this.openAccordions.add(groupId);
		}
	}
	isAccordionOpen(groupId: number): boolean {
		return this.openAccordions.has(groupId);
	}

	fetchTranscripts() {
		if (!this.currentUser) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/transcript/get-by-user/${this.currentUser.id}`;
		this.http
			.get<Transcript>(apiUrl)
			.pipe(
				finalize(() => {
					this.loadingService.hide();
				}),
			)
			.subscribe({
				next: (data) => {
					this.transcript = data;
				},
				error: (error) => {
					console.error('Error fetching transcript:', error);
				},
			});
	}
	fetchCurriculum(): void {
		if (!this.currentUser) return;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/curriculum/get/${this.currentUser.curriculum.id}`;
		this.loadingService.show(() => {
			this.http
				.get<Curriculum>(apiUrl)
				.pipe(
					finalize(() => {
						this.loadingService.hide();
					}),
				)
				.subscribe({
					next: (data) => {
						this.curriculum = data;
					},
					error: (error) => {
						console.error('Error fetching curriculum:', error);
					},
				});
		});
	}
}
