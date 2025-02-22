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
		const curriculumId = +route.params['curriculum'];
		const isGened = route.params['isGened'];

		// ตรวจสอบค่าพื้นฐานก่อน
		if (!this.validateBasicParams(year, semester, classYear, isGened)) {
			this.router.navigate(['/subject']);
			return of(false);
		}

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
				const curriculumExists = curriculums.some((c) => c.id === curriculumId);
				if (!curriculumExists) {
					throw new Error('Invalid curriculum');
				}
				return true;
			}),
			catchError((error) => {
				console.error('Validation error:', error);
				this.router.navigate(['/subject']);
				return of(false);
			}),
		);
	}

	private validateBasicParams(year: number, semester: number, classYear: string, isGened: string): boolean {
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

		// ตรวจสอบ isGened ว่าเป็น "1" หรือ "0" เท่านั้น
		const validIsGened = isGened === '1' || isGened === '0';
		if (!validIsGened) return false;

		return true;
	}
}

// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { classYearList, semesterList, yearsList } from '@pages/subjects/subject-page-data';
// import { APIManagementService } from '@services/api-management.service';
// import { Observable, of } from 'rxjs';
// import { catchError, map, switchMap } from 'rxjs/operators';

// @Injectable({
// 	providedIn: 'root',
// })
// export class SubjectValidationGuard implements CanActivate {
// 	constructor(
// 		private router: Router,
// 		private apiManagementService: APIManagementService,
// 	) {}

// 	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
// 		const year = +route.params['year'];
// 		const semester = +route.params['semester'];
// 		const classYear = route.params['classYear'];
// 		const facultyId = +route.params['faculty'];
// 		const isGened = route.params['isGened'];

// 		// ตรวจสอบค่าพื้นฐานก่อน
// 		if (!this.validateBasicParams(year, semester, classYear)) {
// 			this.router.navigate(['/subject']);
// 			console.log('1111111111111111111111111111111111111111');
// 			return of(false);
// 		}

// 		return this.apiManagementService.GetDropdownFaculties().pipe(
// 			switchMap((faculties) => {
// 				const facultyExists = faculties.some((f) => f.id === facultyId);
// 				if (!facultyExists) {
// 					console.log('2222222222222222222222222222222222222');
// 					throw new Error('Invalid faculty');
// 				}

// 				// กรณี GenEd (faculty = 0)
// 				if (facultyId === 0) {
// 					// ตรวจสอบว่ามีพารามิเตอร์เกินมาหรือไม่
// 					if (route.params['department'] || route.params['program']) {
// 						console.log('333333333333333333333333333333333333333');
// 						throw new Error('Invalid parameters for GenEd');
// 					}
// 					// กรณี GenEd curriculum ต้องเป็น 0 เท่านั้น
// 					if (+route.params['curriculum'] !== 0) {
// 						console.log('4444444444444444444444444444444444444444');
// 						throw new Error('Invalid curriculum for GenEd');
// 					}
// 					return of(true);
// 				}

// 				// กรณีปกติ ต้องมีพารามิเตอร์ครบ
// 				const departmentId = +route.params['department'];
// 				const programId = +route.params['program'];
// 				const curriculumId = +route.params['curriculum'];

// 				if (!departmentId || !programId || !curriculumId) {
// 					console.log('55555555555555555555555555555555555555555');
// 					throw new Error('Missing required parameters');
// 				}

// 				// ดำเนินการตรวจสอบต่อสำหรับคณะปกติ
// 				return this.validateRegularFaculty(facultyId, departmentId, programId, curriculumId);
// 			}),
// 			catchError((error) => {
// 				console.error('Validation error:', error);
// 				console.log('65666666666666666666666666666666666666');
// 				this.router.navigate(['/subject']);
// 				return of(false);
// 			}),
// 		);
// 	}

// 	private validateRegularFaculty(facultyId: number, departmentId: number, programId: number, curriculumId: number): Observable<boolean> {
// 		return this.apiManagementService.GetDropdownDepartments(facultyId).pipe(
// 			switchMap((departments) => {
// 				const departmentExists = departments.some((d) => d.id === departmentId);
// 				if (!departmentExists) {
// 					console.log('777777777777777777777777777777777777777777');
// 					throw new Error('Invalid department');
// 				}

// 				return this.apiManagementService.GetDropdownPrograms(departmentId).pipe(
// 					switchMap((programs) => {
// 						const programExists = programs.some((p) => p.id === programId);
// 						if (!programExists) {
// 							console.log('8888888888888888888888888888888888888888888888');
// 							throw new Error('Invalid program');
// 						}

// 						return this.apiManagementService.GetDropdownCurriculums(programId).pipe(
// 							map((curriculums) => {
// 								const curriculumExists = curriculums.some((c) => c.id === curriculumId);
// 								if (!curriculumExists) {
// 									console.log('99999999999999999999999999999999999999999999');
// 									throw new Error('Invalid curriculum');
// 								}
// 								console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
// 								return true;
// 							}),
// 						);
// 					}),
// 				);
// 			}),
// 		);
// 	}

// 	private validateBasicParams(year: number, semester: number, classYear: string): boolean {
// 		// ตรวจสอบปีการศึกษาจาก yearsList
// 		const validYear = yearsList.some((y) => y.value === year);
// 		if (!validYear) return false;

// 		// ตรวจสอบเทอมจาก semesterList
// 		const validSemester = semesterList.some((s) => s.value === semester);
// 		if (!validSemester) return false;

// 		// ตรวจสอบชั้นปีจาก classYearList
// 		// แปลง classYear จาก string เป็น number เพื่อเทียบกับ value ใน list
// 		const classYearNumber = parseInt(classYear);
// 		// const validClassYear = classYearList.some((c) => c.value === classYearNumber && c.value !== 0); // ไม่รวม "ทุกชั้นปี"
// 		const validClassYear = classYearList.some((c) => c.value === classYearNumber);
// 		if (!validClassYear) return false;

// 		return true;
// 	}
// }
