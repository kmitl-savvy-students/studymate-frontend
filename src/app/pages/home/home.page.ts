import { AfterViewInit, Component } from '@angular/core';
import { AnnounceComponent } from '../../components/announce/announce.component';
import { LetPlanComponent } from '../../components/let-plan/let-plan.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { SDMButtonLink } from '../../components/buttons/link/button-link.component';
import { PicBoxHomeComponent } from '../../components/pic-box-home/pic-box-home.component';
import { TextBoxHomeComponent } from '../../components/text-box-home/text-box-home.component';
import { IconComponent } from '../../components/icon/icon.component';
import { initFlowbite } from 'flowbite';
import { SDMChooseCurriculumModalComponent } from '../../components/modals/choose-curriculum-modal/choose-curriculum-modal.component';

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
	ngAfterViewInit(): void {
		initFlowbite();
	}
}
