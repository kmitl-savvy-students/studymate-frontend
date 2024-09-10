import { Routes } from '@angular/router';
import { SDMPageHome } from './pages/home/home.page';
import { SDMPageSignUp } from './pages/sign-up/sign-up.page';
import { SDMPageSignIn } from './pages/sign-in/sign-in.page';

export const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: SDMPageHome },
	{ path: 'sign-up', component: SDMPageSignUp },
	{ path: 'sign-in', component: SDMPageSignIn },
];
