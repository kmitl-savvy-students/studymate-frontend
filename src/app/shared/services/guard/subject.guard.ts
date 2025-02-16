import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { classYearList, semesterList, yearsList } from '@pages/subjects/subject-page-data';
import { APIManagementService } from '@services/api-management.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class SubjectValidationGuard implements CanActivate {
	constructor(
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const year = +route.params['year'];
		const semester = +route.params['semester'];
		const classYear = route.params['classYear'];
		const facultyId = +route.params['faculty'];
		const departmentId = +route.params['department'];
		const programId = +route.params['program'];
		const curriculumId = route.params['curriculum'];

		// ตรวจสอบค่าพื้นฐานก่อน
		if (!this.validateBasicParams(year, semester, classYear)) {
			this.router.navigate(['/**']);
			return of(false);
		}

		// กรณี GenEd
		// if (facultyId === 90 && departmentId === 90) {
		// 	return of(true);
		// }

		// ตรวจสอบข้อมูลจาก API ตามลำดับ
		return this.apiManagementService.GetDropdownFaculties().pipe(
			switchMap((faculties) => {
				const facultyExists = faculties.some((f) => f.id === facultyId);
				if (!facultyExists) {
					throw new Error('Invalid faculty');
				}

				return this.apiManagementService.GetDropdownDepartments(facultyId);
			}),
			switchMap((departments) => {
				const departmentExists = departments.some((d) => d.id === departmentId);
				if (!departmentExists) {
					throw new Error('Invalid department');
				}

				return this.apiManagementService.GetDropdownPrograms(departmentId);
			}),
			switchMap((programs) => {
				const programExists = programs.some((p) => p.id === programId);
				if (!programExists) {
					throw new Error('Invalid program');
				}

				return this.apiManagementService.GetDropdownCurriculums(programId);
			}),
			map((curriculums) => {
				const curriculumExists = curriculums.some((c) => c.id.toString() === curriculumId);
				if (!curriculumExists) {
					throw new Error('Invalid curriculum');
				}
				return true;
			}),
			catchError((error) => {
				console.error('Validation error:', error);
				this.router.navigate(['/**']);
				return of(false);
			}),
		);
	}

	private validateBasicParams(year: number, semester: number, classYear: string): boolean {
		// ตรวจสอบปีการศึกษาจาก yearsList
		const validYear = yearsList.some((y) => y.value === year);
		if (!validYear) return false;

		// ตรวจสอบเทอมจาก semesterList
		const validSemester = semesterList.some((s) => s.value === semester);
		if (!validSemester) return false;

		// ตรวจสอบชั้นปีจาก classYearList
		// แปลง classYear จาก string เป็น number เพื่อเทียบกับ value ใน list
		const classYearNumber = parseInt(classYear);
		// const validClassYear = classYearList.some((c) => c.value === classYearNumber && c.value !== 0); // ไม่รวม "ทุกชั้นปี"
		const validClassYear = classYearList.some((c) => c.value === classYearNumber);
		if (!validClassYear) return false;

		return true;
	}
}
