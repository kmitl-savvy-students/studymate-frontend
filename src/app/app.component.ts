import { Component } from '@angular/core';

import { User } from './models/User.model';
import { NavbarComponent } from "./components/navbar/navbar.component";

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [NavbarComponent],

	templateUrl: './app.component.html',
})
export class AppComponent {
	users: User[] = [];

	addUser() {
		this.users.push(new User('asd', 'asd'));
	}
}
