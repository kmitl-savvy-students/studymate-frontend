import { Routes } from '@angular/router';
import { SDMPageHome } from './pages/home/home.page';
import { SDMPageSignUp } from './pages/sign-up/sign-up.page';
import { SDMPageSignIn } from './pages/sign-in/sign-in.page';
import { SDMMySubject } from './pages/my-subject/my-subject.page';
import { SDMSubject } from './pages/subject/subject.page';
import { SDMPageProfile } from './pages/profile/profile.page';
import { SDMPageSubjectDetail } from './pages/subject-detail/subject-detail.page';
import { SDMPageNotFound } from './pages/page-not-found/page-not-found.page';
import { SDMPageSignOut } from './pages/sign-out/sign-out.page';
import { AuthenticationGuard } from './shared/services/authentication/authentication.guard';
import { SDMPageReview } from './pages/review/review.page';
import { SDMPageFaculty } from './pages/admin/faculty/faculty.page';
import { SDMPageDepartment } from './pages/admin/department/department.page';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full',
	},
	{ path: 'home', component: SDMPageHome },

	{
		path: 'subject',
		component: SDMSubject,
	},

	{
		path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear',
		component: SDMSubject,
	},

	{
		path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear/:curriculumYear/:uniqueId',
		component: SDMSubject,
	},

	{ path: 'subject/subject-detail', component: SDMPageSubjectDetail },
	{
		path: 'subject/subject-detail/:subjectId',
		component: SDMPageSubjectDetail,
	},
	{ path: 'review', component: SDMPageReview },

	{ path: 'sign-in', component: SDMPageSignIn },
	{ path: 'sign-up', component: SDMPageSignUp },
	{
		path: 'my-subject',
		component: SDMMySubject,
		canActivate: [AuthenticationGuard],
	},
	{
		path: 'profile',
		component: SDMPageProfile,
		canActivate: [AuthenticationGuard],
	},
	{
		path: 'sign-out',
		component: SDMPageSignOut,
		canActivate: [AuthenticationGuard],
	},

	{ path: 'admin/faculty', component: SDMPageFaculty },
	{ path: 'admin/department/:facultyId', component: SDMPageDepartment },

	{ path: '**', component: SDMPageNotFound },
];
