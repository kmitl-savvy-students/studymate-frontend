import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { semesterList, yearsList } from '@pages/subjects/subject-page-data';
import { APIManagementService } from '@services/api-management.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class SubjectDetailValidationGuard implements CanActivate {
	constructor(
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const year = +route.params['year'];
		const semester = +route.params['semester'];
		const curriculumId = +route.params['curriculum'];
		const section = +route.params['section'];
		const subjectId = route.params['subjectId'];
		const isGened = route.params['isGened'];

		console.log('year : ', year);
		console.log('semester : ', semester);
		console.log('curriculumId : ', curriculumId);
		console.log('section : ', section);
		console.log('subjectId : ', subjectId);
		console.log('isGened : ', isGened);
		console.log('typeof isGened : ', typeof isGened);

		// Case 1: Direct subject access (without year/semester/curriculumId/section/isGened)
		if ((isNaN(year) || year === -1) && (isNaN(semester) || semester === -1) && (isNaN(curriculumId) || curriculumId === -1) && (isNaN(section) || section === -1) && (!isGened || isGened === '') && subjectId) {
			return this.validateDirectSubjectAccess(subjectId);
		}

		// Case 2: Full path access (with all parameters)
		if (subjectId && !isNaN(year) && !isNaN(semester) && !isNaN(curriculumId) && !isNaN(section) && isGened) {
			return this.validateFullPathAccess(year, semester, curriculumId, section, subjectId, isGened);
		}

		// Invalid route parameters
		this.router.navigate(['/subject']);
		return of(false);
	}

	private validateDirectSubjectAccess(subjectId: string): Observable<boolean> {
		return this.apiManagementService.GetSubjectsDataBySubjectId(subjectId).pipe(
			map((subject) => {
				if (subject) {
					return true;
				}
				this.router.navigate(['/subject']);
				return false;
			}),
			catchError(() => {
				this.router.navigate(['/subject']);
				return of(false);
			}),
		);
	}

	private validateFullPathAccess(year: number, semester: number, curriculumId: number, section: number, subjectId: string, isGened: string): Observable<boolean> {
		// First validate basic parameters
		if (!this.validateBasicParams(year, semester, isGened)) {
			this.router.navigate(['/subject']);
			return of(false);
		}

		// Directly validate subject and section
		return this.apiManagementService.GetSubjectsDataBySection(year - 543, semester, curriculumId, subjectId, section.toString(), isGened).pipe(
			map((subject) => {
				if (subject) {
					return true;
				}
				this.router.navigate(['/subject']);
				return false;
			}),
			catchError((error) => {
				console.log('Error fetching subject data:', error);
				this.router.navigate(['/subject']);
				return of(false);
			}),
		);
	}

	private validateBasicParams(year: number, semester: number, isGened: string): boolean {
		const validYear = yearsList.some((y) => y.value === year);
		if (!validYear) return false;

		const validSemester = semesterList.some((s) => s.value === semester);
		if (!validSemester) return false;

		// ตรวจสอบ isGened ว่าเป็น "1" หรือ "0" เท่านั้น
		const validIsGened = isGened === '1' || isGened === '0';
		if (!validIsGened) return false;

		return true;
	}
}
