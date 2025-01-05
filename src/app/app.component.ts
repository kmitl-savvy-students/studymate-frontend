import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { initFlowbite } from 'flowbite';
import { AlertComponent } from './shared/services/alert/alert.component';
import { FontAwesomeIconsService } from './shared/services/font-awesome-icons.service';

@Component({
	standalone: true,
	selector: 'app-root',
	imports: [RouterOutlet, NavbarComponent, FooterComponent, AlertComponent],
	templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
	constructor(
		public router: Router,
		public fontAwesomeService: FontAwesomeIconsService,
	) {}

	ngOnInit(): void {
		initFlowbite();
	}
}
