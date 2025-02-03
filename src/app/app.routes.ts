import { Routes } from '@angular/router';
import { SDMPageCurriculumGroup } from '@pages/admin/curriculum-group/curriculum-group.page';
import { SDMPageCurriculumType } from './pages/admin/curriculum-type/curriculum-type.page';
import { SDMPageCurriculum } from './pages/admin/curriculum/curriculum.page';
import { SDMPageDepartment } from './pages/admin/department/department.page';
import { SDMPageFaculty } from './pages/admin/faculty/faculty.page';
import { SDMPageHome } from './pages/home/home.page';
import { SDMMySubject } from './pages/my-subject/my-subject.page';
import { SDMPageNotFound } from './pages/page-not-found/page-not-found.page';
import { SDMPageProfile } from './pages/profile/profile.page';
import { SDMPageReview } from './pages/review/review.page';
import { SDMPageSignIn } from './pages/sign-in/sign-in.page';
import { SDMPageSignOut } from './pages/sign-out/sign-out.page';
import { SDMPageSignUp } from './pages/sign-up/sign-up.page';
import { SDMPageSubjectDetail } from './pages/subject-detail/subject-detail.page';
import { SDMSubject } from './pages/subject/subject.page';
import { AuthenticationGuard } from './shared/services/authentication/authentication.guard';

export const routes: Routes = [
	// Redirect Page
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full',
	},

	// Hpme Page
	{ path: 'home', component: SDMPageHome },

	// Subject Detail Page
	{
		path: 'subject/subject-detail/:subjectId',
		component: SDMPageSubjectDetail,
	},
	{
		path: 'subject/subject-detail/:year/:semester/:faculty/:department/:curriculum/:classYear/:section/:subjectId',
		component: SDMPageSubjectDetail,
	},
	{
		path: 'subject/subject-detail/:year/:semester/:faculty/:department/:curriculum/:classYear/:curriculumYear/:uniqueId/:section/:subjectId',
		component: SDMPageSubjectDetail,
	},

	// Subject Page
	{
		path: 'subject',
		component: SDMSubject,
	},
	{
		path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear',
		component: SDMSubject,
	},
	{
		path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear/:curriculumYear/:curriculumIndex/:uniqueId',
		component: SDMSubject,
	},

	// Review Page
	{ path: 'review', component: SDMPageReview },

	// Sign In Page
	{ path: 'sign-in', component: SDMPageSignIn },

	// Sign Up Page
	{ path: 'sign-up', component: SDMPageSignUp },

	// My Subject Page
	{
		path: 'my-subject',
		component: SDMMySubject,
		canActivate: [AuthenticationGuard],
	},

	// Profile Page
	{
		path: 'profile',
		component: SDMPageProfile,
		canActivate: [AuthenticationGuard],
	},

	// Sign Out Page
	{
		path: 'sign-out',
		component: SDMPageSignOut,
		canActivate: [AuthenticationGuard],
	},

	{ path: 'admin/faculty', component: SDMPageFaculty },
	{ path: 'admin/department/:facultyId', component: SDMPageDepartment },
	{ path: 'admin/curriculum-type/:departmentId', component: SDMPageCurriculumType },
	{ path: 'admin/curriculum/:curriculumTypeId', component: SDMPageCurriculum },
	{ path: 'admin/curriculum-group/:curriculumId', component: SDMPageCurriculumGroup },

	{ path: '**', component: SDMPageNotFound },
];
