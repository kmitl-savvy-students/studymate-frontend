import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { FontAwesomeIconsService } from './shared/services/font-awesome-icons.service';
import { initFlowbite } from 'flowbite';
import { SDMChooseCurriculumModalComponent } from './components/modals/choose-curriculum-modal/choose-curriculum-modal.component';

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [
		RouterOutlet,
		NavbarComponent,
		FooterComponent,
		SDMChooseCurriculumModalComponent,
	],

	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
	constructor(
		public router: Router,
		private serviceFontAwesome: FontAwesomeIconsService,
	) {}

	ngOnInit(): void {
		initFlowbite();
	}
}
