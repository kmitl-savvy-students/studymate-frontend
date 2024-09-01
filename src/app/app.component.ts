import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './models/User.model';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SignUpComponent } from "./components/sign-up/sign-up.component";

@Component({
	standalone: true,
	selector: 'app-root',

	imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    SignUpComponent
],

	templateUrl: './app.component.html',
})
export class AppComponent {
	users: User[] = [];

	addUser() {
		this.users.push(new User('asd', 'asd'));
	}
}
