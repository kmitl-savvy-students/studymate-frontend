import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';
import { SDMBaseButton } from '../buttons/base-button.component';

@Component({
	selector: 'sdm-button-nav',
	standalone: true,
	imports: [SDMBaseButton],
	template: `<sdm-base-button [text]="text" (clickEvent)="handleClick()" />`,
})
export class SDMButtonNav {
	constructor(
		private loadingService: LoadingService,
		private router: Router,
	) {}

	@Input() link: string = '/';
	@Input() text: string = 'Empty text';

	handleClick() {
		this.loadingService.pulse(() => {
			this.router.navigate([this.link]);
		});
	}
}
