import { Component, Input } from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { Router, RouterLink } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-button-nav',
	standalone: true,
	imports: [RouterLink, SDMBaseButton],
	template: `
		<button type="button" (click)="handleClick()">
			<sdm-base-button [text]="text" textColorHover="text-main-100" />
		</button>
	`,
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
