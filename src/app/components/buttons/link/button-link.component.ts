import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
	selector: 'sdm-button-link',
	standalone: true,
	imports: [FontAwesomeModule, CommonModule, RouterModule],
	templateUrl: './button-link.component.html',
	styleUrl: './button-link.component.css',
})
export class SDMButtonLink {
	@Input() label: string = 'กดปุ่มเลย';
	@Input() link: string = '/';
	@Input() icon: string = '';
	@Input() external: boolean = false;
}
