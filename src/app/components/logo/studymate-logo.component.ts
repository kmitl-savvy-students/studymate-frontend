import { Component, EventEmitter } from '@angular/core';
import { LoadingService } from '../../shared/services/loading/loading.service';
import { Router } from '@angular/router';

@Component({
	selector: 'sdm-studymate-logo',
	standalone: true,
	template: `
		<button
			type="button"
			class="flex flex-col items-center"
			(click)="handleClick()"
		>
			<span class="text-4xl font-semibold text-main-100">KMITL</span>
			<span class="-mt-2 text-xl text-main-100">StudyMate</span>
		</button>
	`,
})
export class StudyMateLogo {
	constructor(
		private loadingService: LoadingService,
		private router: Router,
	) {}

	handleClick() {
		this.loadingService.pulse(() => {
			this.router.navigate(['/home']);
		});
	}
}
