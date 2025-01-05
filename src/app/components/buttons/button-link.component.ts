import { Component, Input } from '@angular/core';
import { SDMBaseButton } from './base-button.component';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'sdm-button-link',
	standalone: true,
	imports: [RouterLink, SDMBaseButton],
	template: `
		<a [routerLink]="link">
			<sdm-base-button
				[icon]="icon"
				[text]="text"
				[textColor]="textColor"
				[textColorHover]="textColorHover"
				[backgroundColor]="backgroundColor"
				[backgroundColorHover]="backgroundColorHover"
			>
			</sdm-base-button>
		</a>
	`,
})
export class SDMButtonLink {
	@Input() link: string = '/';

	@Input() text: string = 'Empty text';
	@Input() icon: string = '';
	@Input() iconCustom: any | null = null;

	@Input() textColor: string = 'text-dark-100';
	@Input() textColorHover: string = 'text-dark-100';

	@Input() backgroundColor: string = 'bg-main-5';
	@Input() backgroundColorHover: string = 'bg-main-10';
}
