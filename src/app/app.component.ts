import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './models/User.model';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AnnounceComponent } from './components/announce/announce.component';
import { LetPlanComponent } from './components/let-plan/let-plan.component';

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [
		NavbarComponent,
		FooterComponent,
		AnnounceComponent,
		LetPlanComponent,
		RouterOutlet,
	],

	templateUrl: './app.component.html',
})
export class AppComponent {
	users: User[] = [];

	addUser() {
		this.users.push(new User('asd', 'asd'));
	}
}
