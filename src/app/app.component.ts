import { Component } from '@angular/core';

import { User } from './models/User.model';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FooterComponent } from "./components/footer/footer.component";

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [NavbarComponent, FooterComponent],

	templateUrl: './app.component.html',
})
export class AppComponent {
	users: User[] = [];

	addUser() {
		this.users.push(new User('asd', 'asd'));
	}
}
