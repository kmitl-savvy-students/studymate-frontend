import {
	AfterViewInit,
	Component,
	ElementRef,
	OnInit,
	ViewChild,
} from '@angular/core';
import { AnnounceComponent } from '../../components/announce/announce.component';
import { LetPlanComponent } from '../../components/let-plan/let-plan.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { SDMButtonLink } from '../../components/buttons/link/button-link.component';
import { PicBoxHomeComponent } from '../../components/pic-box-home/pic-box-home.component';
import { TextBoxHomeComponent } from '../../components/text-box-home/text-box-home.component';
import { IconComponent } from '../../components/icon/icon.component';
import { initFlowbite, initModals, ModalOptions } from 'flowbite';
import { SDMChooseCurriculumModalComponent } from '../../components/modals/choose-curriculum-modal/choose-curriculum-modal.component';
import { AuthService } from '../../shared/auth.service';
import { User } from '../../shared/api-manage/models/User';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Modal } from 'flowbite';

@Component({
	selector: 'sdm-page-home',
	standalone: true,
	imports: [
		AnnounceComponent,
		LetPlanComponent,
		CardHomeComponent,
		SDMButtonLink,
		PicBoxHomeComponent,
		TextBoxHomeComponent,
		IconComponent,
		SDMChooseCurriculumModalComponent,
	],
	templateUrl: './home.page.html',
	styleUrl: './home.page.css',
})
export class SDMPageHome implements AfterViewInit {
	constructor(private authService: AuthService) {}
	@ViewChild('chooseCurriculumModal')
	chooseCurriculumModal!: ElementRef;

	user: User | null = null;
	isSignIn = false;

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
	}
}
