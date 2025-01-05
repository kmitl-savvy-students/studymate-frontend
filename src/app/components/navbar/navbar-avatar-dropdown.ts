import { Component, Input, OnInit } from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMButtonLink } from '../buttons/button-link.component';
import { Dropdown, DropdownInterface } from 'flowbite';
import { SDMAvatarIcon } from '../avatar/avatar.component';
import { User } from '../../shared/models/User.model';

@Component({
	selector: 'sdm-avatar-dropdown-nav',
	standalone: true,
	imports: [SDMBaseButton, SDMButtonLink, SDMAvatarIcon],
	template: `
		<sdm-base-button
			id="avatarDropdownButton"
			[text]="'สวัสดีครับ คุณ ' + currentUser?.name_nick"
			textColorHover="text-main-100"
			[iconCustom]="customIconTemplate"
			iconEnd="angle-down"
			dropdownToggle="avatarDropdown"
		/>
		<div
			id="avatarDropdown"
			class="z-10 hidden gap-4 rounded-sm border border-main-15 bg-white p-4 dark:bg-gray-700"
		>
			<sdm-button-link
				link="/my-subject"
				text="รายวิชาของฉัน"
				textColorHover="text-main-100"
				backgroundColor="bg-white"
				(clickEvent)="closeDropdown()"
			/>
			<sdm-button-link
				link="/my-schedule"
				text="จัดตารางเรียน"
				textColorHover="text-main-100"
				backgroundColor="bg-white"
				(clickEvent)="closeDropdown()"
			/>
			<sdm-button-link
				link="/profile"
				text="โปรไฟล์"
				textColorHover="text-main-100"
				backgroundColor="bg-white"
				(clickEvent)="closeDropdown()"
			/>
			<sdm-button-link
				link="/sign-out"
				text="ออกจากระบบ"
				textColorHover="text-main-100"
				backgroundColor="bg-white"
				(clickEvent)="closeDropdown()"
			/>
		</div>

		<ng-template #customIconTemplate>
			<sdm-avatar-icon [imagePath]="currentUser?.profile ?? ''" />
		</ng-template>
	`,
})
export class SDMAvatarDropdownNav implements OnInit {
	@Input() currentUser: User | null = null;

	dropdown: DropdownInterface | undefined;

	ngOnInit(): void {
		const $dropdownTarget = document.getElementById('avatarDropdown');
		const $dropdownTrigger = document.getElementById(
			'avatarDropdownButton',
		);
		this.dropdown = new Dropdown($dropdownTarget, $dropdownTrigger);
	}
	closeDropdown() {
		if (this.dropdown) this.dropdown.hide();
	}
}
