import { Routes } from '@angular/router';
import { SDMPageCurriculumGroup } from '@pages/admin/curriculum-group/curriculum-group.page';
import { SDMPageCurriculum } from '@pages/admin/curriculum/curriculum.page';
import { SDMPageDepartment } from '@pages/admin/department/department.page';
import { SDMPageFaculty } from '@pages/admin/faculty/faculty.page';
import { SDMPageProgram } from '@pages/admin/program/program.page';
import { SDMPageCurriculumProgressTracker } from '@pages/curriculum-progress-tracker/curriculum-progress-tracker.page';
import { SDMPageHome } from '@pages/home/home.page';
import { SDMPageMySubject } from '@pages/my-subject/my-subject.page';
import { SDMPageNotFound } from '@pages/page-not-found/page-not-found.page';
import { SDMPageProfile } from '@pages/profile/profile.page';
import { SDMPageReview } from '@pages/review/review.page';
import { SDMPageSignIn } from '@pages/sign-in/sign-in.page';
import { SDMPageSignOut } from '@pages/sign-out/sign-out.page';
import { SDMPageSignUp } from '@pages/sign-up/sign-up.page';
import { SDMPageSubjectDetail } from '@pages/subject-detail/subject-detail.page';
import { SDMPageSubject } from '@pages/subjects/subject.page';
import { SDMPageSubjects } from '@pages/subjects/subjects.page';
import { AuthenticationGuard } from '@services/authentication/authentication.guard';

export const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: SDMPageHome },

	// #region Old Subject Detail
	{ path: 'subject/subject-detail/:subjectId', component: SDMPageSubjectDetail },
	{ path: 'subject/subject-detail/:year/:semester/:faculty/:department/:curriculum/:classYear/:section/:subjectId', component: SDMPageSubjectDetail },
	{ path: 'subject/subject-detail/:year/:semester/:faculty/:department/:curriculum/:classYear/:curriculumYear/:uniqueId/:section/:subjectId', component: SDMPageSubjectDetail },
	// #endregion
	// #region Old Subjects
	{ path: 'subject', component: SDMPageSubject },
	{ path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear', component: SDMPageSubject },
	{ path: 'subject/:year/:semester/:faculty/:department/:curriculum/:classYear/:curriculumYear/:uniqueId', component: SDMPageSubject },
	// #endregion

	// #region New Subjects
	{ path: 'subjects', component: SDMPageSubjects },
	// #endregion

	// #region Edit Curriculum Structure
	{ path: 'admin/faculty', component: SDMPageFaculty },
	{ path: 'admin/department/:facultyId', component: SDMPageDepartment },
	{ path: 'admin/program/:departmentId', component: SDMPageProgram },
	{ path: 'admin/curriculum/:programId', component: SDMPageCurriculum },
	{ path: 'admin/curriculum-group/:curriculumId', component: SDMPageCurriculumGroup },
	// #endregion

	// #region Authentication
	{ path: 'sign-in', component: SDMPageSignIn },
	{ path: 'sign-up', component: SDMPageSignUp },
	{ path: 'sign-out', component: SDMPageSignOut, canActivate: [AuthenticationGuard] },
	// #endregion
	// #region Others
	{ path: 'review', component: SDMPageReview },
	{ path: 'my-subject', component: SDMPageMySubject, canActivate: [AuthenticationGuard] },
	{ path: 'curriculum-progress-tracker', component: SDMPageCurriculumProgressTracker, canActivate: [AuthenticationGuard] },
	{ path: 'profile', component: SDMPageProfile, canActivate: [AuthenticationGuard] },
	// #endregion

	{ path: '**', component: SDMPageNotFound },
];
