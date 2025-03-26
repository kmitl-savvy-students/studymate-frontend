import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading/loading.service';

@Component({
	selector: 'sdm-studymate-logo',
	standalone: true,
	template: `
		<button type="button" class="flex flex-col items-center text-primary-300 transition-all hover:scale-105 hover:text-primary-400" (click)="handleClick()">
			<span class="font-semibold" [class]="textSize1">KMITL</span>
			<span class="-mt-2" [class]="textSize2">StudyMate</span>
		</button>
	`,
})
export class StudyMateLogo {
	@Input() textSize1: string = 'text-4xl';
	@Input() textSize2: string = 'text-xl';

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
