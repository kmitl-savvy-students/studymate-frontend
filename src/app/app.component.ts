import { Component } from '@angular/core';

import { User } from './models/User.model';

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [],

	templateUrl: './app.component.html',
})
export class AppComponent {
	users: User[] = [];

	addUser() {
		this.users.push(new User('asd', 'asd'));
	}
}
