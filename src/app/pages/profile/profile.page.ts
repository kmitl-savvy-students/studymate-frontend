import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AlertService } from '@services/alert/alert.service';
import { BackendService } from '@services/backend.service';
import { SelectCurriculumModalService } from '@services/select-curriculum-modal.service';
import { SDMBaseButton } from '../../components/buttons/base-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMBaseModal } from '../../components/modals/base-modal.component';
import { User } from '../../shared/models/User.model';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';

@Component({
	selector: 'sdm-page-profile',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, SDMBaseModal, SDMBaseButton, IconComponent],
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.css'],
})
export class SDMPageProfile {
	@ViewChild('uploadProfileModal') uploadProfileModal!: SDMBaseModal;
	@ViewChild('editPasswordModal') editPasswordModal!: SDMBaseModal;

	public currentUser: User | null = null;
	public editProfileForm: FormGroup;
	public isEditProfile = false;
	public isEditProfileLoading = false;
	public predefinedAvatars: string[] = [];
	public selectedAvatar: string | null = null;

	private readonly PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=_])[A-Za-z\d@$!%*?&#^+=_]{8,}$/;
	public passwordForm!: FormGroup;

	constructor(
		private authService: AuthenticationService,
		private fb: FormBuilder,
		private backendService: BackendService,
		private alertService: AlertService,
		private http: HttpClient,
		private selectCurriculumService: SelectCurriculumModalService,
	) {
		// Initialize the editProfileForm
		this.editProfileForm = this.fb.group({
			nickname: [''],
			firstname: [''],
			lastname: [''],
		});

		// Initialize the passwordForm AFTER the FormBuilder is available
		this.passwordForm = this.fb.group(
			{
				newPassword: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
				confirmPassword: ['', Validators.required],
			},
			{ validators: [this.matchPasswords] },
		);
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

	// ----------  Profile Info Editing Logic ----------
	toggleEditProfileForm(status: boolean): void {
		this.isEditProfile = status;
		const method = status ? 'enable' : 'disable';
		this.editProfileForm.get('nickname')?.[method]();
		this.editProfileForm.get('firstname')?.[method]();
		this.editProfileForm.get('lastname')?.[method]();
	}

	onEditProfileForm(): void {
		this.toggleEditProfileForm(true);
	}

	onEditProfileFormCancel(): void {
		this.toggleEditProfileForm(false);
	}

	onEditProfileFormConfirm(): void {
		if (!this.currentUser) return;
		this.isEditProfileLoading = true;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update/data`;
		const payload = {
			id: this.currentUser.id,
			nick_name: this.editProfileForm.value.nickname,
			first_name: this.editProfileForm.value.firstname,
			last_name: this.editProfileForm.value.lastname,
			profile_picture: this.currentUser.profile_picture || '',
		};

		this.http
			.put(apiUrl, payload)
			.pipe(finalize(() => (this.isEditProfileLoading = false)))
			.subscribe({
				next: () => {
					if (!this.currentUser) return;
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

	// ---------- Avatar Update Logic ----------
	onUploadProfile(): void {
		this.reRollAvatars();
		this.uploadProfileModal.show();
	}

	reRollAvatars(): void {
		this.selectedAvatar = null;
		this.predefinedAvatars = Array.from({ length: 16 }).map(() => {
			const randomSeed = Math.floor(Math.random() * 10000);
			return `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
		});
	}

	onSelectAvatar(image: string): void {
		this.selectedAvatar = image;
	}

	onConfirmAvatar(): void {
		if (!this.currentUser || !this.selectedAvatar) {
			this.alertService.showAlert('error', 'กรุณาเลือกภาพโปรไฟล์ที่ต้องการเปลี่ยน');
			return;
		}
		this.isEditProfileLoading = true;

		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update/data`;
		const payload = {
			id: this.currentUser.id,
			nick_name: this.currentUser.nickname || '',
			first_name: this.currentUser.firstname || '',
			last_name: this.currentUser.lastname || '',
			profile_picture: this.selectedAvatar,
		};

		this.http
			.put(apiUrl, payload)
			.pipe(finalize(() => (this.isEditProfileLoading = false)))
			.subscribe({
				next: () => {
					if (!this.currentUser) return;
					this.currentUser.profile_picture = this.selectedAvatar ?? '';
					this.authService.setUser(this.currentUser);
					this.alertService.showAlert('success', 'อัปเดตรูปโปรไฟล์เสร็จสิ้น');
					this.uploadProfileModal.hide();
				},
				error: () => {
					console.error('Error updating profile picture');
				},
			});
	}

	// ---------- Password Change Logic ----------
	openEditPasswordModal(): void {
		this.passwordForm.reset();
		this.editPasswordModal.show();
	}

	onConfirmChangePassword(): void {
		if (!this.currentUser) {
			this.alertService.showAlert('error', 'ไม่พบข้อมูลผู้ใช้');
			return;
		}
		if (this.passwordForm.invalid) {
			return;
		}

		this.isEditProfileLoading = true;
		const apiUrl = `${this.backendService.getBackendUrl()}/api/user/update/password`;
		const payload = {
			id: this.currentUser.id,
			password: this.passwordForm.value.newPassword,
			password_confirm: this.passwordForm.value.confirmPassword,
		};

		this.http
			.put(apiUrl, payload)
			.pipe(finalize(() => (this.isEditProfileLoading = false)))
			.subscribe({
				next: () => {
					this.alertService.showAlert('success', 'เปลี่ยนรหัสผ่านสำเร็จ!');
					this.editPasswordModal.hide();
				},
				error: () => {
					this.alertService.showAlert('error', 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
				},
			});
	}

	private matchPasswords(group: AbstractControl) {
		const pass = group.get('newPassword')?.value;
		const confirm = group.get('confirmPassword')?.value;
		return pass === confirm ? null : { passwordMismatch: true };
	}

	toggleEditCurriculum(): void {
		this.selectCurriculumService.cancelable();
		this.selectCurriculumService.open();
	}
}
