import { Component, Input } from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'sdm-button-nav',
	standalone: true,
	imports: [RouterLink, SDMBaseButton],
	template: `
		<a [routerLink]="link">
			<sdm-base-button [text]="text" textColorHover="text-main-100" />
		</a>
	`,
})
export class SDMButtonNav {
	@Input() link: string = '/';
	@Input() text: string = 'Empty text';
}
