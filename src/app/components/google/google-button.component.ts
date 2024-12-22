import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SDMBaseButton } from '../base-button/base-button.component';
import { SDMGoogleIconSVG } from './google-svg.component';

@Component({
	selector: 'sdm-google-button',
	standalone: true,
	template: `
		<sdm-base-button
			*ngIf="isSignIn == true"
			[iconCustom]="customIconTemplate"
			text="เข้าสู่ระบบด้วย Google"
		></sdm-base-button>
		<sdm-base-button
			*ngIf="isSignUp == true"
			text="สมัครสมาชิกด้วย Google"
		></sdm-base-button>

		<ng-template #customIconTemplate>
			<sdm-google-icon-svg></sdm-google-icon-svg>
		</ng-template>
	`,
	imports: [CommonModule, SDMBaseButton, SDMGoogleIconSVG],
})
export class SDMGoogleButton {
	@Input() isSignIn: boolean = false;
	@Input() isSignUp: boolean = false;
}
