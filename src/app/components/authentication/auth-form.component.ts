import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SDMButtonLink } from '../buttons/button-link.component';
import { StudyMateLogo } from '../logo/studymate-logo.component';

@Component({
	selector: 'sdm-auth-form',
	standalone: true,
	imports: [ReactiveFormsModule, StudyMateLogo, SDMButtonLink],
	// template: `
	// 	<div class="grid min-h-screen grid-cols-2">
	// 		<div class="flex items-center justify-center bg-orange-50">
	// 			<img src="images/auth/signup-signin-boy.png" alt="signup-signin-boy" />
	// 		</div>
	// 		<div class="flex items-center justify-center bg-white">
	// 			<div class="rounded-[40px] border border-main-25 px-20 py-12">
	// 				<div class="flex min-h-full w-96 flex-col">
	// 					<div class="flex w-full justify-center">
	// 						<sdm-studymate-logo />
	// 					</div>
	// 					<h2 class="mt-4 text-center text-xl font-medium text-dark-100">
	// 						{{ authHeader }}
	// 					</h2>
	// 					<div class="mt-6">
	// 						<form [formGroup]="formGroup" (ngSubmit)="handleSubmit()" class="space-y-4">
	// 							<ng-content />
	// 						</form>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</div>
	// `,

	template: `
		<div class="flex min-h-screen">
			<div class="flex w-2/5 items-center justify-center bg-orange-50 max-[768px]:hidden">
				<img src="images/auth/signup-signin-boy.png" alt="signup-signin-boy" class="w-3/4" />
			</div>
			<div class="flex w-3/5 items-center justify-center bg-white max-[768px]:w-full">
				<div class="w-3/4 rounded-[40px] 2xl:w-[690px]">
					<!-- <div class="flex w-full justify-start px-12 pt-12 max-[768px]:px-2">
						<sdm-button-link
							link="/home"
							text="กลับหน้าหลัก"
							textSize="text-sm"
							icon="right-from-bracket"
							fontWeight="font-medium"
							textColor="text-light"
							textColorHover="text-light"
							backgroundColor="bg-main-100"
							backgroundColorHover="hover:bg-main-120"
							width="w-fit"></sdm-button-link>
					</div> -->
					<div class="flex min-h-full flex-col p-12 max-[768px]:px-0">
						<div class="flex w-full justify-center">
							<sdm-studymate-logo />
						</div>
						<h2 class="mt-4 text-center text-xl font-medium text-dark-100">
							{{ authHeader }}
						</h2>
						<div class="mt-6">
							<form [formGroup]="formGroup" (ngSubmit)="handleSubmit()" class="space-y-4">
								<ng-content />
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
})
export class SDMAuthForm {
	@Input() authHeader: string = '';

	@Input() formGroup: FormGroup = new FormGroup({});
	@Input() onSubmit: (() => void) | undefined;

	handleSubmit() {
		if (this.onSubmit) this.onSubmit();
	}
}
