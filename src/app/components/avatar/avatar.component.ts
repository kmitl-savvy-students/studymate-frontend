import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'sdm-avatar-icon',
	standalone: true,
	imports: [CommonModule],
	template: `
		<ng-container *ngIf="isSignIn; else showNavbarIcon">
			<div class="h-8 w-8 overflow-hidden rounded-full border border-gray-300">
				<img [src]="resolvedImagePath" alt="User Avatar" class="h-full w-full object-cover" />
			</div>
		</ng-container>
		<ng-template #showNavbarIcon>
			<button
				type="button"
				class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 dark:text-gray-400"
				data-drawer-target="nav-sidebar"
				data-drawer-show="nav-sidebar"
				aria-controls="nav-sidebar"
				aria-expanded="false">
				<span class="sr-only">Open main menu</span>
				<svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
				</svg>
			</button>
		</ng-template>
	`,
})
export class SDMAvatarIcon implements OnInit {
	@Input() imagePath: string = 'images/default-user-avatar.png';
	@Input() navbar: boolean = false;
	@Input() isSignIn: boolean = false;
	resolvedImagePath: string = 'images/default-user-avatar.png';

	constructor() {}

	ngOnInit(): void {
		this.validateImagePath(this.imagePath)
			.then((isValid) => {
				this.resolvedImagePath = isValid ? this.imagePath : 'images/default-user-avatar.png';
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
