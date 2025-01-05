import { Component, Input } from '@angular/core';
import { StudyMateLogo } from '../logo/studymate-logo.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'sdm-auth-form',
	standalone: true,
	imports: [ReactiveFormsModule, StudyMateLogo],
	template: `
		<div class="grid min-h-screen grid-cols-2">
			<div class="flex items-center justify-center bg-orange-50">
				<img
					src="images/auth/signup-signin-boy.png"
					alt="signup-signin-boy"
				/>
			</div>
			<div class="flex items-center justify-center bg-white">
				<div class="rounded-[40px] border border-main-25 px-20 py-12">
					<div class="flex min-h-full w-80 flex-col 2xl:w-96">
						<div class="flex w-full justify-center">
							<sdm-studymate-logo />
						</div>
						<h2
							class="mt-4 text-center text-xl font-medium text-dark-100"
						>
							{{ authHeader }}
						</h2>
						<div class="xl:mt-4 2xl:mt-6">
							<form
								[formGroup]="formGroup"
								(ngSubmit)="handleSubmit()"
								class="xl:space-y-2.5 2xl:space-y-4"
							>
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
