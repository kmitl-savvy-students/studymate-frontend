import { SubjectCardData } from './../models/SubjectCardData.model';
import { Curriculum } from './../models/Curriculum.model';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { GoogleLink } from '../models/GoogleLink.model';
import { UserToken } from '../models/UserToken.model';
import { TranscriptData } from '../models/TranscriptData.model';
import { Observable } from 'rxjs/internal/Observable';
import { CurriculumGroup } from '../models/CurriculumGroup.model';
import { CurriculumSubgroup } from '../models/CurriculumSubgroup.model';
import { CurriculumSubject } from '../models/CurriculumSubject.model';
import { GenedGroup } from '../models/GenedGroup.model';
import { GenedSubject } from '../models/GenedSubject.model';
import { CurriculumTeachtableSubject } from '../models/CurriculumTeachtableSubject.model.js';
import { subjectDetailData } from '../models/SubjectDetailData.model';

@Injectable({
	providedIn: 'root',
})
export class APIManagementService {
	constructor(private http: HttpClient) {}

	GetAuthHeader(userTokenId: string) {
		const headers = new HttpHeaders().set(
			'Authorization',
			`Bearer ${userTokenId}`,
		);
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

	GetCurriculumGroups(
		uniqueId: string,
		year: string,
	): Observable<CurriculumGroup[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-group/get/${uniqueId}/${year}`;
		return this.http.get<CurriculumGroup[]>(apiUrl);
	}

	GetCurriculumGroup(
		categoryId: number,
		groupId: number,
		uniqueId: string,
		year: string,
	): Observable<CurriculumGroup> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-group/get/${categoryId}/${groupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumGroup>(apiUrl);
	}

	GetCurriculumSubgroups(
		uniqueId: string,
		year: string,
	): Observable<CurriculumSubgroup[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subgroup/get/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubgroup[]>(apiUrl);
	}

	GetCurriculumSubgroup(
		categoryId: number,
		groupId: number,
		subgroupId: number,
		uniqueId: string,
		year: string,
	): Observable<CurriculumSubgroup> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subgroup/get/${categoryId}/${groupId}/${subgroupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubgroup>(apiUrl);
	}

	GetCurriculumSubjects(
		categoryId: number,
		groupId: number,
		subgroupId: number,
		uniqueId: string,
		year: string,
	): Observable<CurriculumSubject[]> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${categoryId}/${groupId}/${subgroupId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubject[]>(apiUrl);
	}

	GetCurriculumSubject(subjectId: string): Observable<CurriculumSubject> {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${subjectId}`;
		return this.http.get<CurriculumSubject>(apiUrl);
	}

	GetCurriculumSubjectsTeachtable(
		year: number,
		semester: number,
		faculty: string,
		department: string,
		curriculum: string,
		classYear: number,
		curriculumYear?: string,
		uniqueId?: string,
	): Observable<SubjectCardData[]> {
		let apiUrl = `${environment.backendUrl}/api/curriculum-teachtable-subject/${year}/${semester}/${faculty}/${department}/${curriculum}/${classYear}`;

		if (curriculumYear) {
			apiUrl += `/${curriculumYear}`;
		}
		if (uniqueId) {
			apiUrl += `/${uniqueId}`;
		}

		return this.http.get<SubjectCardData[]>(apiUrl);
	}

	GetCurriculumTeachtableSubject(
		subjectId: string,
	): Observable<subjectDetailData> {
		let apiUrl = `${environment.backendUrl}/api/curriculum-teachtable-subject-get/${subjectId}`;

		return this.http.get<subjectDetailData>(apiUrl);
	}

	// GetCurriculumSubjectsTeachtable(
	// 	year: number,
	// 	semester: number,
	// 	faculty : string,
	// 	department: string,
	// 	curriculum : string,
	// 	classYear: number,
	// ): Observable<CurriculumTeachtableSubject> {
	// 	const apiUrl = `${environment.backendUrl}/api/curriculum-teachtable-subject/${year}/${semester}/${faculty}/${department}/${curriculum}/${classYear}`;
	// 	return this.http.get<CurriculumTeachtableSubject>(apiUrl);
	// }

	GetCurriculumSubjectByUniqueIdYear(
		subjectId: string,
		uniqueId: string,
		year: string,
	) {
		const apiUrl = `${environment.backendUrl}/api/curriculum-subject/get/${subjectId}/${uniqueId}/${year}`;
		return this.http.get<CurriculumSubject>(apiUrl);
	}

	GetCurriculumTeachtable(
		year: number,
		semester: number,
		faculty: string,
		department: string,
		curriculum: string,
		classYear: number,
	) {
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

	GetTranscriptData(userTokenId: string, userId?: string) {
		const apiUrl = `${environment.backendUrl}/api/transcript/get/${userId}`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.get<TranscriptData[]>(apiUrl, { headers });
	}

	UpdateUserTranscriptByUpload(
		userId: string,
		userTokenId: string,
		file: File,
	): Observable<HttpEvent<any>> {
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
		return this.http.patch(
			apiUrl,
			{ id: userId, curriculum_id: curId },
			{ headers },
		);
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

	DeleteTranscriptData(userTokenId: string, userId?: string) {
		const apiUrl = `${environment.backendUrl}/api/transcript/delete/${userId}`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.delete(apiUrl, { headers });
	}

	SignoutUserfromSystem(userTokenId: string) {
		const apiUrl = `${environment.backendUrl}/api/auth/sign-out`;
		const headers = this.GetAuthHeader(userTokenId);
		return this.http.post<UserToken>(
			apiUrl,
			{ user_token_id: userTokenId },
			{ headers },
		);
	}
}
