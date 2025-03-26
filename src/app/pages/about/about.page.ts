import { Component } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { StudyMateLogo } from '../../components/logo/studymate-logo.component';

@Component({
	selector: 'sdm-page-about',
	standalone: true,
	imports: [IconComponent, StudyMateLogo],
	templateUrl: './about.page.html',
})
export class SDMPageAbout {}
