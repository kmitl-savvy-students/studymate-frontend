import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading.service';

@Component({
	selector: 'app-loading-overlay',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div
			*ngIf="isVisible"
			[ngClass]="{
				'animation-fade-in': !isInitialLoad && isLoading,
				'animation-fade-out': !isLoading,
			}"
			class="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
		>
			<div [ngClass]="{ 'animation-jump-out': !isLoading }">
				<div class="icon animation-pulse flex flex-col items-center">
					<span class="text-6xl font-semibold text-main-100"
						>KMITL</span
					>
					<span class="-mt-2 text-3xl text-main-100">StudyMate</span>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			@keyframes fadeIn {
				0% {
					opacity: 0;
				}
				100% {
					opacity: 1;
				}
			}

			@keyframes fadeOut {
				0% {
					opacity: 1;
				}
				80% {
					opacity: 0;
				}
				100% {
					opacity: 0;
				}
			}

			@keyframes jumpOut {
				0% {
					opacity: 1;
					transform: translateY(0) scale(1);
				}
				100% {
					opacity: 0;
					transform: translateY(5px) scale(1.5);
				}
			}

			@keyframes pulse {
				0% {
					transform: scale(1);
				}
				50% {
					transform: scale(1.1);
				}
				100% {
					transform: scale(1);
				}
			}

			:host {
				pointer-events: none;
			}

			.fixed {
				pointer-events: auto;
			}

			.animation-fade-in {
				animation: fadeIn 350ms ease-in-out forwards;
			}

			.animation-fade-out {
				animation: fadeOut 350ms ease-in-out forwards;
			}

			.animation-jump-out {
				animation: jumpOut 350ms ease-in-out forwards;
			}

			.animation-pulse {
				animation: pulse 1.2s infinite;
			}
		`,
	],
})
export class LoadingOverlayComponent {
	isLoading = true;
	isVisible = true;
	isInitialLoad = true;

	private fadeOutDuration = 350;

	constructor(private loadingService: LoadingService) {
		this.loadingService.loading$.subscribe((state) => {
			if (state) {
				this.isVisible = true;
				this.isLoading = true;
			} else {
				this.isLoading = false;

				setTimeout(() => {
					this.isVisible = false;
					this.isInitialLoad = false;
				}, this.fadeOutDuration);
			}
		});
	}
}
