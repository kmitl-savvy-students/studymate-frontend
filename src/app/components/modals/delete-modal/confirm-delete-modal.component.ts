import { APIManagementService } from './../../../shared/api-manage/api-management.service';
import {
	Component,
	Input,
	AfterViewInit,
	OnInit,
	SimpleChanges,
	OnChanges,
} from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { AuthService } from '../../../shared/auth.service';
import { ImportTranscriptComponent } from '../import-transcript-modal/import-transcript-modal.component';

@Component({
	selector: 'sdm-confirm-delete-modal',
	standalone: true,
	imports: [IconComponent, ImportTranscriptComponent],
	templateUrl: './confirm-delete-modal.component.html',
	styleUrl: './confirm-delete-modal.component.css',
})
export class SDMConfirmDeleteModalComponent
	implements AfterViewInit, OnInit, OnChanges
{
	@Input() modalID: string = '';
	@Input() text: string = '';
	@Input() subtext: string = '';
	@Input() haveTranscriptData: boolean = false;
	public userTokenId: string | null = '';
	public userId: string | null = '';
	public transcriptFlag: boolean = false;
	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}
	ngOnInit(): void {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['haveTranscriptData']) {
			this.transcriptFlag = this.haveTranscriptData;
		}
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
		if (this.transcriptFlag !== false) {
			this.apiManagementService
				.DeleteTranscriptData(this.userTokenId ?? '', this.userId ?? '')
				.subscribe({
					next: (res) => {
						window.location.reload();
					},
					error: (error) => {
						if (error.status === 404) {
							console.error('Not found');
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
		} else {
			alert('not have transcript data, upload transcript first');
		}
	}
}
