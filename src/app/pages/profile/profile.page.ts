import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { finalize } from 'rxjs';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMBaseModal } from '../../components/modals/base-modal.component';
import { User } from '../../shared/models/User.model.js';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
	selector: 'sdm-page-profile',
	standalone: true,
	imports: [IconComponent, CommonModule, SDMBaseButton, ReactiveFormsModule, SDMBaseModal],
	templateUrl: './profile.page.html',
	styleUrl: './profile.page.css',
})
export class SDMPageProfile {
	public currentUser: User | null = null;

	constructor(
		private authService: AuthenticationService,
		private fb: FormBuilder,
		private backendService: BackendService,
		private alertService: AlertService,
		private http: HttpClient,
	) {
		this.editProfileForm = this.fb.group({
			nickname: [''],
			firstname: [''],
			lastname: [''],
		});
	}

	ngOnInit(): void {
		this.authService.user$.subscribe((user) => {
			this.currentUser = user;

			this.editProfileForm.patchValue({
				nickname: this.currentUser?.nickname,
				firstname: this.currentUser?.firstname,
				lastname: this.currentUser?.lastname,
			});
			this.toggleEditProfileForm(false);
		});
	}

	editProfileForm: FormGroup;
	isEditProfile: boolean = false;
	isEditProfileLoading: boolean = false;

	onEditProfileForm(): void {
		this.toggleEditProfileForm(true);
	}
	onEditProfileFormCancel(): void {
		this.toggleEditProfileForm(false);
	}
	onEditProfileFormConfirm(): void {
		if (this.currentUser == null) return;
		this.isEditProfileLoading = true;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update/data`;
		const payload = {
			id: this.currentUser.id,
			nick_name: this.editProfileForm.value.nickname,
			first_name: this.editProfileForm.value.firstname,
			last_name: this.editProfileForm.value.lastname,
		};
		this.http
			.put(apiUrl, payload)
			.pipe(finalize(() => (this.isEditProfileLoading = false)))
			.subscribe({
				next: () => {
					if (this.currentUser === null) return;
					this.currentUser.nickname = this.editProfileForm.value.nickname;
					this.currentUser.firstname = this.editProfileForm.value.firstname;
					this.currentUser.lastname = this.editProfileForm.value.lastname;
					this.authService.setUser(this.currentUser);

					this.alertService.showAlert('success', 'บันทึกข้อมูลเสร็จสิ้น');

					this.toggleEditProfileForm(false);
				},
				error: () => {
					console.error('Error update user profile');
				},
			});
	}
	toggleEditProfileForm(status: boolean): void {
		this.isEditProfile = status;
		if (!this.isEditProfile) {
			this.editProfileForm.get('nickname')?.disable();
			this.editProfileForm.get('firstname')?.disable();
			this.editProfileForm.get('lastname')?.disable();
		} else {
			this.editProfileForm.get('nickname')?.enable();
			this.editProfileForm.get('firstname')?.enable();
			this.editProfileForm.get('lastname')?.enable();
		}
	}

	@ViewChild('uploadProfileModal') uploadProfileModal!: SDMBaseModal;
	onUploadProfile(): void {
		this.uploadProfileModal.show();
	}
}
