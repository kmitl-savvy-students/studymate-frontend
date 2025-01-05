import { Component } from '@angular/core';

@Component({
	selector: 'sdm-avatar-icon',
	standalone: true,
	template: `
		<div
			class="h-8 w-8 overflow-hidden rounded-full border border-gray-300"
		>
			<img
				[src]="imagePath"
				alt="User Avatar"
				class="h-full w-full object-cover"
			/>
		</div>
	`,
})
export class SDMAvatarIcon {
	imagePath: string = 'images/default-avatar.png';
}
