import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-announce',
	standalone: true,
	imports: [FontAwesomeModule],
	templateUrl: './announce.component.html',
	styleUrl: './announce.component.css',
})
export class AnnounceComponent {
	@Input() details: { detail: string; date: string }[] = [];
}
