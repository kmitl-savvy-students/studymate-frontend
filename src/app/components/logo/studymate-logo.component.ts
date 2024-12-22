import { Component } from '@angular/core';

@Component({
	selector: 'sdm-studymate-logo',
	standalone: true,
	template: `
		<div class="flex flex-col items-center">
			<span class="text-5xl font-semibold text-main-100">KMITL</span>
			<span class="-mt-3 text-2xl font-semibold text-main-100">
				StudyMate
			</span>
		</div>
	`,
})
export class StudyMateLogo {}
