import { Routes } from '@angular/router';
import { SDMPageAbout } from '@pages/about/about.page';
import { SDMPageCurriculumGroup } from '@pages/admin/curriculum-group/curriculum-group.page';
import { SDMPageCurriculum } from '@pages/admin/curriculum/curriculum.page';
import { SDMPageDepartment } from '@pages/admin/department/department.page';
import { SDMPageFaculty } from '@pages/admin/faculty/faculty.page';
import { SDMPageProgram } from '@pages/admin/program/program.page';
import { SDMPageCurriculumProgressTracker } from '@pages/curriculum-progress-tracker/curriculum-progress-tracker.page';
import { SDMPageHome } from '@pages/home/home.page';
import { SDMPageMySubject } from '@pages/my-subject/my-subject.page';
import { SDMPageNotFound } from '@pages/page-not-found/page-not-found.page';
import { SDMPagePrivacyPolicy } from '@pages/privacy-policy/privacy-policy.page';
import { SDMPageProfile } from '@pages/profile/profile.page';
import { SDMPageReview } from '@pages/review/review.page';
import { SDMPageSignIn } from '@pages/sign-in/sign-in.page';
import { SDMPageSignOut } from '@pages/sign-out/sign-out.page';
import { SDMPageSignUp } from '@pages/sign-up/sign-up.page';
import { SDMPageSubjectDetail } from '@pages/subject-detail/subject-detail.page';
import { SDMPageSubject } from '@pages/subjects/subject.page';
import { SDMPageTermOfUse } from '@pages/term-of-use/term-of-use.page';
import { AuthenticationGuard } from '@services/authentication/authentication.guard';
import { SubjectDetailValidationGuard } from '@services/guard/subject-detail.guard';
import { SubjectValidationGuard } from '@services/guard/subject.guard';

export const routes: Routes = [
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: 'home', component: SDMPageHome },

	// #region New Subject Detail
	{ path: 'subject/subject-detail/:subjectId', component: SDMPageSubjectDetail, canActivate: [SubjectDetailValidationGuard] },
	{ path: 'subject/subject-detail/:year/:semester/:curriculum/:section/:subjectId/:isGened', component: SDMPageSubjectDetail, canActivate: [SubjectDetailValidationGuard] },
	// #endregion

	// #region Old Subjects
	{ path: 'subject', component: SDMPageSubject },
	{ path: 'subject/:year/:semester/:classYear/:faculty/:department/:program/:curriculum/:isGened', component: SDMPageSubject, canActivate: [SubjectValidationGuard] },
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
	{ path: 'about', component: SDMPageAbout },
	{ path: 'privacy-policy', component: SDMPagePrivacyPolicy },
	{ path: 'term-of-use', component: SDMPageTermOfUse },
	// #endregion

	{ path: '**', component: SDMPageNotFound },
];
