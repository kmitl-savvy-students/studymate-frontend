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
export class SDMConfirmDeleteModalComponent implements AfterViewInit {
	@Input() modalID: string = '';
	@Input() text: string = '';
	@Input() subtext: string = '';
	@Input() deleteFunction!: () => void;

	ngAfterViewInit(): void {
		initFlowbite();
	}

	confirmDelete(): void {
		if (this.deleteFunction) {
			this.deleteFunction();
		}
	}
}
