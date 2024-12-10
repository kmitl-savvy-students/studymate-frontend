import { Routes } from '@angular/router';
import { SDMPageHome } from './pages/home/home.page';
import { SDMPageSignUp } from './pages/sign-up/sign-up.page';
import { SDMPageSignIn } from './pages/sign-in/sign-in.page';
import { SDMMySubject } from './pages/my-subject/my-subject.page';
import { SDMSubject } from './pages/subject/subject.page';
import { AuthGuard } from './curriculum.guard';
import { SDMPageProfile } from './pages/profile/profile.page';
import { SDMSubjectDetail } from './pages/subject-detail/subject-detail.page';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full',
	},
	{ path: 'home', component: SDMPageHome },
	{ path: 'sign-up', component: SDMPageSignUp },
	{ path: 'sign-in', component: SDMPageSignIn },
	{
		path: 'my-subject',
		component: SDMMySubject,
	},
	{ path: 'subject', component: SDMSubject },
	{ path: 'subject-detail', component: SDMSubjectDetail },
	{ path: 'profile', component: SDMPageProfile },
];
