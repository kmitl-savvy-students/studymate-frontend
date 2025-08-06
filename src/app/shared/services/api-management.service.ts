import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Department } from '@models/Department';
import { Faculty } from '@models/Faculty';
import { OtpRequest, OtpVerify } from '@models/OtpData.model';
import { Program } from '@models/Program.model';
import { SubjectRatingReview } from '@models/Subject.model';
import { Transcript } from '@models/Transcript.model.js';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';
import { CurriculumGroup } from '../models/CurriculumGroup.model';
import { CurriculumSubgroup } from '../models/CurriculumSubgroup.model';
import { CurriculumSubject } from '../models/CurriculumSubject.model';
import { GenedGroup } from '../models/GenedGroup.model';
import { GenedSubject } from '../models/GenedSubject.model';
import { GoogleLink } from '../models/GoogleLink.model';
import { SubjectReviewData } from '../models/SubjectReviewData.model';
import { UserToken } from '../models/UserToken.model';
import { Curriculum } from './../models/Curriculum.model';
import { SubjectCardData } from './../models/SubjectCardData.model';

@Injectable({ providedIn: 'root' })
export class APIManagementService {
	constructor(private http: HttpClient) {}

	GetAuthHeader(userTokenId: string) {
		const headers = new HttpHeaders().set('Authorization', `Bearer ${userTokenId}`);
		return headers;
	}

	GetUserOauthSignup() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-up`;
		return this.http.get<GoogleLink>(apiUrl);
	}

	GetUserOauthSignin() {
		const apiUrl = `${environment.backendUrl}/api/google/link/sign-in`;
		return this.http.get<GoogleLink>(apiUrl);
	}

	GetUserToken(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/auth/token`;
		return this.http.post<UserToken>(apiUrl, {
			user_token_id: userTokenId,
		});
	}

	GetUserPolicy(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/user/get-policy-by-user-id`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.get(apiUrl, { headers });
	}

	GetCurriculum() {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get`;
		return this.http.get<Curriculum[]>(apiUrl);
	}

	GetCurriculumById(id: number) {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get/${id}`;
		return this.http.get<Curriculum[]>(apiUrl);
	}

	GetCurriculumByUniqueIdYear(uniqueId: string, year: string) {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get/${uniqueId}/${year}`;
		return this.http.get<Curriculum[]>(apiUrl);
	}

	GetCurriculumGroups(uniqueId: string, year: string): Observable<CurriculumGroup[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-group/get/${uniqueId}/${year}`;
		return this.http.get<CurriculumGroup[]>(apiUrl);
	}

	GetCurriculumGroup(categoryId: number, groupId: number, uniqueId: string, year: string): Observable<CurriculumGroup> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-group/get/${categoryId}/${groupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumGroup>(apiUrl);
	}

	GetCurriculumSubgroups(uniqueId: string, year: string): Observable<CurriculumSubgroup[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subgroup/get/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubgroup[]>(apiUrl);
	}

	GetCurriculumSubgroup(categoryId: number, groupId: number, subgroupId: number, uniqueId: string, year: string): Observable<CurriculumSubgroup> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subgroup/get/${categoryId}/${groupId}/${subgroupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubgroup>(apiUrl);
	}

	GetCurriculumSubjects(categoryId: number, groupId: number, subgroupId: number, uniqueId: string, year: string): Observable<CurriculumSubject[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${categoryId}/${groupId}/${subgroupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubject[]>(apiUrl);
	}

	GetCurriculumSubject(subjectId: string): Observable<CurriculumSubject> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${subjectId}`;
		return this.http.get<CurriculumSubject>(apiUrl);
	}

	// get รายวิชาในหน้า subject ใหม่
	GetSubjectsDataInSubjectPage(year: number, semester: number, classYear: string, curriculumId: number, is_gened: string): Observable<SubjectCardData[]> {
		const apiUrl = `${environment.backendUrl}/api/subject-class/get-by-class`;

		const params = new HttpParams().set('academic_year', year).set('academic_term', semester).set('year', classYear).set('curriculumId', curriculumId).set('is_gened', is_gened);

		return this.http.get<SubjectCardData[]>(apiUrl, { params });
	}

	// get ข้อมูลรายวิชานั้นๆทั้งหมดในหน้า subject-detail ใหม่
	GetSubjectsDataBySection(year: number, semester: number, curriculumId: number, subjectId: string, section: string, is_gened: string): Observable<SubjectCardData> {
		const apiUrl = `${environment.backendUrl}/api/subject-class/get-by-subject-id`;

		const params = new HttpParams().set('academic_year', year).set('academic_term', semester).set('curriculumId', curriculumId).set('subjectId', subjectId).set('section', section).set('is_gened', is_gened);

		return this.http.get<SubjectCardData>(apiUrl, { params });
	}

	// get ข้อมูลรายวิชานั้นๆอย่างเดียวในหน้า subject-detail ใหม่
	GetSubjectsDataBySubjectId(subjectId: string): Observable<SubjectRatingReview> {
		let apiUrl = `${environment.backendUrl}/api/subject/get/${subjectId}`;

		return this.http.get<SubjectRatingReview>(apiUrl);
	}

	// get Open Subject Data ในหน้า subject-detail ใหม่
	GetOpenSubjectData(year: number, semester: number, curriculumId: number, subjectId: string, is_gened: string): Observable<boolean> {
		const apiUrl = `${environment.backendUrl}/api/subject-class/get-subject-availability`;

		const params = new HttpParams().set('academic_year', year).set('academic_term', semester).set('curriculumId', curriculumId).set('subjectId', subjectId).set('is_gened', is_gened);

		return this.http.get<boolean>(apiUrl, { params });
	}

	GetAllSubjectReviews(): Observable<SubjectReviewData[]> {
		const apiUrl = `${environment.backendUrl}/api/subject-review`;

		return this.http.get<SubjectReviewData[]>(apiUrl);
	}

	CreateSubjectReviewLike(subject_review_id: number) {
		const apiUrl = `${environment.backendUrl}/api/subject-review-like`;

		return this.http.post(apiUrl, { subject_review_id: subject_review_id });
	}

	DeleteSubjectReviewLike(subject_review_id: number) {
		const apiUrl = `${environment.backendUrl}/api/subject-review-like/${subject_review_id}`;

		return this.http.delete(apiUrl);
	}

	GetSubjectReviewLikeByAllUser(subject_review_id: number): Observable<SubjectReviewData[]> {
		const apiUrl = `${environment.backendUrl}/api/subject-review-like/${subject_review_id}`;

		return this.http.get<SubjectReviewData[]>(apiUrl);
	}

	// รอตูนแก้ก่อน แล้วมาแก้อีกที
	GetSubjectReviewsCurrentYearTerm(): Observable<SubjectReviewData[]> {
		const apiUrl = `${environment.backendUrl}/api/subject-review/current`;

		return this.http.get<SubjectReviewData[]>(apiUrl);
	}

	CreateSubjectReviewByUser(student_id: string, year: number, term: number, subject_id: string, review: string, rating: number) {
		const apiUrl = `${environment.backendUrl}/api/subject-review`;
		return this.http.post(apiUrl, {
			student_id: student_id,
			year: year,
			term: term,
			subject_id: subject_id,
			review: review,
			rating: rating,
		});
	}

	UpdateSubjectReviewByUser(student_id: string, subject_id: string, review: string) {
		const apiUrl = `${environment.backendUrl}/api/subject-review/update`;
		return this.http.patch(apiUrl, {
			student_id: student_id,
			subject_id: subject_id,
			review: review,
		});
	}

	GetSubjectReviewsBySubjectID(subjectId: string): Observable<SubjectReviewData[]> {
		const apiUrl = `${environment.backendUrl}/api/subject-review/${subjectId}`;

		return this.http.get<SubjectReviewData[]>(apiUrl);
	}

	GetCurriculumSubjectByUniqueIdYear(subjectId: string, uniqueId: string, year: string) {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${subjectId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubject>(apiUrl);
	}

	GetCurriculumTeachtable(year: number, semester: number, faculty: string, department: string, curriculum: string, classYear: number) {
		const apiUrl = `${environment.backendUrl}/api/curriculum-teachtable-subject/${year}/${semester}/${faculty}/${department}/${curriculum}/${classYear}`;
		return this.http.get<CurriculumSubject>(apiUrl);
	}

	GetGenedSubject(subjectId: string) {
		const apiUrl = `${environment.backendUrl}/api/gened-subject/get/${subjectId}`;
		return this.http.get<GenedSubject>(apiUrl);
	}

	GetGenedGroup(groupId: string) {
		const apiUrl = `${environment.backendUrl}/api/gened-group/get/${groupId}`;
		return this.http.get<GenedGroup>(apiUrl);
	}

	UpdateUserTranscriptByUpload(userId: string, userTokenId: string, file: File): Observable<HttpEvent<any>> {
		const apiUrl = `${environment.backendUrl}/api/transcript/upload`;
		const headers = this.GetAuthHeader(userTokenId);
		const formData: FormData = new FormData();
		formData.append('id', userId);
		formData.append('file', file, file.name);
		return this.http.post(apiUrl, formData, {
			headers,
			reportProgress: true,
			observe: 'events',
		});
	}

	UpdateUserCurriculum(userTokenId: string, userId?: string, curId?: Number) {
		const apiUrl = `${environment.backendUrl}/api/user/update`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.patch(apiUrl, { id: userId, curriculum_id: curId }, { headers });
	}

	UpdateUserPolicy(id: string | undefined) {
		const apiUrl = `${environment.backendUrl}/api/user/update/policy`;
		const body = {
			id: id,
		};
		return this.http.post(apiUrl, body);
	}

	UpdateUserOauthSignupCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;
		return this.http.post<UserToken>(apiUrl, {
			code: authCode,
			redirect_uri: 'sign-up',
		});
	}

	UpdateUserOauthSigninCallback(authCode: string) {
		const apiUrl = `${environment.backendUrl}/api/google/callback`;
		return this.http.post<UserToken>(apiUrl, {
			code: authCode,
			redirect_uri: 'sign-in',
		});
	}

	FetchTranscript(currentUserId: string) {
		const apiUrl = `${environment.backendUrl}/api/transcript/get-by-user/${currentUserId}`;
		return this.http.get<Transcript>(apiUrl);
	}

	DeleteTranscriptData(userTokenId: string, userId?: string) {
		const apiUrl = `${environment.backendUrl}/api/transcript/delete/${userId}`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.delete(apiUrl, { headers });
	}

	DeleteUserReviewData(subjectId: string, studentId: string) {
		const apiUrl = `${environment.backendUrl}/api/subject-review/${subjectId}/${studentId}`;
		return this.http.delete(apiUrl);
	}

	SignoutUserfromSystem(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/auth/sign-out`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.post<UserToken>(apiUrl, { user_token_id: userTokenId }, { headers });
	}

	GetOtpData(userId?: string): Observable<OtpRequest> {
		const apiUrl = `${environment.backendUrl}/api/otp/request/${userId}`;
		return this.http.get<OtpRequest>(apiUrl);
	}

	GetOtpVerify(otpa_id: string, otpa_code: string) {
		const apiUrl = `${environment.backendUrl}/api/otp/verify`;
		return this.http.post<OtpVerify>(apiUrl, {
			otpa_id: otpa_id,
			otpa_code: otpa_code,
		});
	}

	GetDropdownFaculties(): Observable<Faculty[]> {
		const apiUrl = `${environment.backendUrl}/api/faculty/get`;
		return this.http.get<Faculty[]>(apiUrl);
	}

	GetDropdownDepartments(facultyId: number): Observable<Department[]> {
		const apiUrl = `${environment.backendUrl}/api/department/get-by-faculty/${facultyId}`;
		return this.http.get<Department[]>(apiUrl);
	}

	GetDropdownPrograms(departmentId: number): Observable<Program[]> {
		const apiUrl = `${environment.backendUrl}/api/program/get-by-department/${departmentId}`;
		return this.http.get<Program[]>(apiUrl);
	}

	GetDropdownCurriculums(programId: number): Observable<Curriculum[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum/get-by-program/${programId}`;
		return this.http.get<Curriculum[]>(apiUrl);
	}
}
