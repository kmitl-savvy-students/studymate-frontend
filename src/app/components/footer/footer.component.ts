import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconComponent } from '../icon/icon.component';
import { StudyMateLogo } from '../logo/studymate-logo.component';

@Component({
	selector: 'sdm-footer',
	standalone: true,
	imports: [FontAwesomeModule, IconComponent, StudyMateLogo],
	templateUrl: './footer.component.html',
	styleUrl: './footer.component.css',
})
export class FooterComponent {}
