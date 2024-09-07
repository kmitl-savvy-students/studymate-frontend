import { Routes } from '@angular/router';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SDMPageHome } from './pages/home/home.page';

export const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: SDMPageHome },
	{ path: 'sign-up', component: SignUpComponent },
	{ path: 'sign-in', component: SignInComponent },
];
