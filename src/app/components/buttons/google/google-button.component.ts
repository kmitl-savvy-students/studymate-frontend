import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SDMBaseButton } from '../base-button.component';
import { SDMGoogleIconSVG } from './google-svg.component';

@Component({
	selector: 'sdm-google-button',
	standalone: true,
	template: `
		<sdm-base-button
			*ngIf="isSignIn == true"
			[iconCustom]="customIconTemplate"
			text="เข้าสู่ระบบด้วย Google"
			backgroundColor="bg-main-5"
			backgroundColorHover="bg-main-10"
		/>
		<sdm-base-button
			*ngIf="isSignUp == true"
			[iconCustom]="customIconTemplate"
			text="สมัครสมาชิกด้วย Google"
			backgroundColor="bg-main-5"
			backgroundColorHover="bg-main-10"
		/>

		<ng-template #customIconTemplate>
			<sdm-google-icon-svg />
		</ng-template>
	`,
	imports: [CommonModule, SDMBaseButton, SDMGoogleIconSVG],
})
export class SDMGoogleButton {
	@Input() isSignIn: boolean = false;
	@Input() isSignUp: boolean = false;
}
