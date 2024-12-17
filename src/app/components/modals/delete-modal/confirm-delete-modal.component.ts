import {
	Component,
	Input,
	AfterViewInit,
	OnInit,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { AuthService } from '../../../shared/services/auth.service';
import { ImportTranscriptComponent } from '../import-transcript-modal/import-transcript-modal.component';
import { APIManagementService } from './../../../shared/api-manage/api-management.service';


@Component({
	selector: 'sdm-confirm-delete-modal',
	standalone: true,
	imports: [IconComponent],
	templateUrl: './confirm-delete-modal.component.html',
	styleUrls: ['./confirm-delete-modal.component.css'],
})
export class SDMConfirmDeleteModalComponent
	implements AfterViewInit, OnInit, OnChanges
{
	@Input() modalID: string = '';
	@Input() text: string = '';
	@Input() subtext: string = '';

	// Removed haveTranscriptData and transcriptFlag as it's not needed.
	public userTokenId: string | null = '';
	public userId: string | null = '';

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}

	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges) {
		// No need to track haveTranscriptData changes now.
	}

	ngAfterViewInit() {
		this.authService.getToken().subscribe({
			next: (userToken) => {
				if (!userToken) {
					return;
				}
				this.userTokenId = userToken.id;
				this.userId = userToken.user.id;
			},
		});
	}

	deleteTranscriptData() {
		// Directly attempt to delete transcript data.
		// If there's no data, server will respond with an error.
		this.apiManagementService
			.DeleteTranscriptData(this.userTokenId ?? '', this.userId ?? '')
			.subscribe({
				next: (res) => {
					window.location.reload();
				},
				error: (error) => {
					if (error.status === 404) {
						console.error(
							'Not found: No transcript data to delete.',
						);
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}
				},
			});
	}
}
