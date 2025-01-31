import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-icon',
	standalone: true,
	imports: [FontAwesomeModule, CommonModule],
	templateUrl: './icon.component.html',
	styleUrls: ['./icon.component.css'],
})
export class IconComponent {
	@Input() src: string | null = null;
	@Input() icon: string = 'user-circle';
	@Input() iconStyle: string = 'fas';
	@Input() fromLocation: string = '';

	public navbarPlaceholderUrl: string = '';

	onError() {
		if (this.fromLocation === 'navbar') {
			this.src = this.navbarPlaceholderUrl;
		}
	}
}
