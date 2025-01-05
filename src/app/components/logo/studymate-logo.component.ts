import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'sdm-studymate-logo',
	standalone: true,
	imports: [RouterLink],
	template: `
		<a routerLink="/home" class="flex flex-col items-center">
			<span class="text-4xl font-semibold text-main-100">KMITL</span>
			<span class="-mt-2 text-xl text-main-100"> StudyMate </span>
		</a>
	`,
})
export class StudyMateLogo {}
