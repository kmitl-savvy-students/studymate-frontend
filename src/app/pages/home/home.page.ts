import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AnnounceComponent } from '../../components/announce/announce.component';
import { LetPlanComponent } from '../../components/let-plan/let-plan.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { PicBoxHomeComponent } from '../../components/pic-box-home/pic-box-home.component';
import { TextBoxHomeComponent } from '../../components/text-box-home/text-box-home.component';
import { initFlowbite, ModalOptions } from 'flowbite';
import { AuthService } from '../../shared/services/auth.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Modal } from 'flowbite';

import { User } from '../../shared/models/User.model';

@Component({
	selector: 'sdm-page-home',
	standalone: true,
	imports: [
		AnnounceComponent,
		LetPlanComponent,
		CardHomeComponent,
		PicBoxHomeComponent,
		TextBoxHomeComponent,
	],
	templateUrl: './home.page.html',
	styleUrl: './home.page.css',
})
export class SDMPageHome implements AfterViewInit {
	constructor(private authService: AuthService) {}
	@ViewChild('chooseCurriculumModal')
	chooseCurriculumModal!: ElementRef;

	public user: User | null = null;
	public isSignIn: boolean = false;

	ngOnInit(): void {
		this.authService.userTokenSubject
			.pipe(
				filter((token) => token !== null),
				distinctUntilChanged(),
			)
			.subscribe((userToken) => {
				let user = userToken.user;
				if (user) {
					this.isSignIn = true;
					this.user = user;

					const $targetEl = document.getElementById(
						'choose-curriculum-modal',
					);
					const options: ModalOptions = {
						backdrop: 'static',
						backdropClasses:
							'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
						closable: false,
					};
					const modal = new Modal($targetEl, options);

					if (this.user.curriculum == null) modal.show();
				} else {
					this.isSignIn = false;
				}
			});

		// this.authService.curriculumSelected$.subscribe((selected) => {
		// 	if (!selected) {
		// 		const modal = document.getElementById(
		// 			'choose-curriculum-modal',
		// 		);
		// 		if (modal) {
		// 			modal.classList.remove('show');
		// 			modal.classList.add('hidden');
		// 		}
		// 	}
		// });
	}

	ngAfterViewInit(): void {
		initFlowbite();

		// this.authService.curriculumSelected$
		// 	.pipe(distinctUntilChanged())
		// 	.subscribe((selected) => {
		// 		if (!selected && this.isSignIn) {
		// 			if (this.chooseCurriculumModal) {
		// 				this.chooseCurriculumModal.nativeElement.classList.remove(
		// 					'hidden',
		// 				);
		// 				this.chooseCurriculumModal.nativeElement.classList.add(
		// 					'show',
		// 				);
		// 			}
		// 			console.log('SignIn ยัง', this.isSignIn);
		// 			console.log(
		// 				'เลือกยัง',
		// 				this.authService.isCurriculumSelected(),
		// 			);
		// 		}
		// 	});

		// const modalOptions: ModalOptions = {
		// 	placement: 'bottom-right',
		// 	backdrop: 'dynamic',
		// 	backdropClasses:
		// 		'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
		// 	closable: true,
		// 	onHide: () => {
		// 		console.log('modal is hidden');
		// 	},
		// 	onShow: () => {
		// 		console.log('modal is shown');
		// 	},
		// 	onToggle: () => {
		// 		console.log('modal has been toggled');
		// 	},
		// };

		// // instance options object
		// const instanceOptions: InstanceOptions = {
		// 	id: 'modalEl',
		// 	override: true,
		// };

		// const modal: ModalInterface = new Modal(
		// 	$modalElement,
		// 	modalOptions,
		// 	instanceOptions,
		// );

		// modal.show();
	}
}
