import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
	selector: 'sdm-icon',
	standalone: true,
	imports: [FontAwesomeModule],
	templateUrl: './icon.component.html',
	styleUrl: './icon.component.css',
})
export class IconComponent {
	@Input() icon: string = '';
	@Input() iconStyle: string = 'fas';
}
