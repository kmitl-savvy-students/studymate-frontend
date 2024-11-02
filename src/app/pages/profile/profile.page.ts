import { Component } from '@angular/core';
import { SDMChooseCurriculumModalComponent } from '../../components/modals/choose-curriculum-modal/choose-curriculum-modal.component';

@Component({
	selector: 'sdm-page-profile',
	standalone: true,
	imports: [SDMChooseCurriculumModalComponent],
	templateUrl: './profile.page.html',
	styleUrl: './profile.page.css',
})
export class SDMPageProfile {}
