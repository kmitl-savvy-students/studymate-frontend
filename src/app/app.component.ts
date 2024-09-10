import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { FontAwesomeIconsService } from './shared/font-awesome-icons.service';
import { initFlowbite } from 'flowbite';

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [RouterOutlet, NavbarComponent, FooterComponent],

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
