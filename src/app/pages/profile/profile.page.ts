import { AfterViewInit, Component } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { IconComponent } from '../../components/icon/icon.component';
import { User } from '../../shared/models/User.model.js';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-page-profile',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './profile.page.html',
	styleUrl: './profile.page.css',
})
export class SDMPageProfile implements AfterViewInit {
	public currentRoute: string = '';
	public user: User | null = null;
	public isSignIn: boolean = false;
	public fromNavbar: string = 'navbar';
	public isDropdownOpen = false;
	public currentUser: User | null = null;

	public isEditProfile: boolean = false;
	public isEditAccount: boolean = false;
	public isEditTranscript: boolean = false;

	constructor(private authService: AuthenticationService) {}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;
		});
		console.log('profile : ', this.currentUser?.profile);
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public editProfile() {
		this.isEditProfile = !this.isEditProfile;
		console.log('isEditProfile : ', this.isEditProfile);
	}

	public editAccount() {
		this.isEditAccount = !this.isEditAccount;
		console.log('isEditAccount : ', this.isEditAccount);
	}

	public editTranscript() {
		this.isEditTranscript = !this.isEditTranscript;
		console.log('isEditTranscript : ', this.isEditTranscript);
	}
}
