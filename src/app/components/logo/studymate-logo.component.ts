import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-studymate-logo',
	standalone: true,
	template: `
		<button type="button" class="text-primary-300 hover:text-primary-400 flex flex-col items-center transition-all hover:scale-105" (click)="handleClick()">
			<span class="text-4xl font-semibold">KMITL</span>
			<span class="-mt-2 text-xl">StudyMate</span>
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
