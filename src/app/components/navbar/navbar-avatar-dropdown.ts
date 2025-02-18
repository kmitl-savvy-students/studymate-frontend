import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { Dropdown, DropdownInterface } from 'flowbite';
import { User } from '../../shared/models/User.model';
import { SDMAvatarIcon } from '../avatar/avatar.component';
import { SDMBaseButton } from '../buttons/base-button.component';
import { SDMButtonLink } from '../buttons/button-link.component';

@Component({
	selector: 'sdm-avatar-dropdown-nav',
	standalone: true,
	imports: [SDMBaseButton, SDMButtonLink, SDMAvatarIcon, CommonModule],
	template: `
		<sdm-base-button buttonId="avatarDropdownBtn" [text]="'สวัสดีครับ คุณ ' + currentUser?.nickname" textColorHover="hover:text-primary-300" [iconCustom]="customIconTemplate" iconEnd="angle-down" dropdownToggle="avatarDropdown" />
		<div id="avatarDropdown" class="z-10 flex flex-col gap-1 rounded-xl border border-primary-200 bg-light p-2">
			<sdm-button-link link="/my-subject" text="รายวิชาของฉัน" textColorHover="hover:text-light" backgroundColor="bg-light" backgroundColorHover="hover:bg-primary-300" (clickEvent)="closeDropdown()" />
			<sdm-button-link link="/profile" text="โปรไฟล์" textColorHover="hover:text-light" backgroundColor="bg-light" backgroundColorHover="hover:bg-primary-300" (clickEvent)="closeDropdown()" />
			<sdm-button-link *ngIf="currentUser?.is_admin" link="/admin/faculty" text="จัดการหลักสูตร" textColorHover="hover:text-light" backgroundColor="bg-light" backgroundColorHover="hover:bg-primary-300" (clickEvent)="closeDropdown()" />
			<sdm-button-link link="/sign-out" text="ออกจากระบบ" textColorHover="hover:text-light" backgroundColor="bg-light" backgroundColorHover="hover:bg-primary-300" (clickEvent)="closeDropdown()" />
		</div>

		<ng-template #customIconTemplate>
			<sdm-avatar-icon [imagePath]="currentUser?.profile_picture ?? ''" />
		</ng-template>
	`,
})
export class SDMAvatarDropdownNav implements AfterViewInit {
	@Input() currentUser: User | null = null;

	dropdown: DropdownInterface | undefined;

	ngAfterViewInit(): void {
		const $dropdownTarget = document.getElementById('avatarDropdown');
		const $dropdownTrigger = document.getElementById('avatarDropdownBtn');
		this.dropdown = new Dropdown($dropdownTarget, $dropdownTrigger);
		this.dropdown.hide();
	}
	closeDropdown() {
		if (this.dropdown) this.dropdown.hide();
	}
}
