import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'sdm-avatar-icon',
	standalone: true,
	template: `
		<div
			class="h-8 w-8 overflow-hidden rounded-full border border-gray-300"
		>
			<img
				[src]="resolvedImagePath"
				alt="User Avatar"
				class="h-full w-full object-cover"
			/>
		</div>
	`,
})
export class SDMAvatarIcon implements OnInit {
	@Input() imagePath: string = 'images/default-user-avatar.png';
	resolvedImagePath: string = 'images/default-user-avatar.png';

	constructor() {}

	ngOnInit(): void {
		this.validateImagePath(this.imagePath)
			.then((isValid) => {
				this.resolvedImagePath = isValid
					? this.imagePath
					: 'images/default-user-avatar.png';
			})
			.catch(() => {
				this.resolvedImagePath = 'images/default-user-avatar.png';
			});
	}

	private validateImagePath(path: string): Promise<boolean> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
			img.src = path;
		});
	}
}
