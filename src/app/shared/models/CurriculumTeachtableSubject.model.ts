import { SubjectCardData } from "./SubjectCardData.model.js";

export class CurriculumTeachtableSubject {
	constructor(
		public faculty_id: string,
		public department_id: string,
		public curriculum2_id: string,
		public classYear: string,
		public faculty_name_th: string,
		public faculty_name_en: string,
		public department_name_th: string | null,
		public department_name_en: string | null,
		public curriculum_name_th: string | null,
		public curriculum_name_en: string | null,
		public teachtable: TeachTable[]
	) {}
}
  
export class TeachTable {
	constructor(
		public data: SubjectCardData[]
	) {}
 }
  
// export class TeachData {
// 	constructor(
// 		public subject_id: string,
//         public credit: number,
//         public section: number,
//         public subject_name_th: string,
//         public subject_name_en: string,
//         public subject_type_name: string | null,
//         public subject_subtype_name: string | null,
//         public classdatetime: string[],
//         public classbuilding: string | null,
//         public room_no: string | null,
//         public rule: string | null,
//         public teacher_list_th: string[],
//         public teacher_list_en: string[],
//         public lect_or_prac: string,
//         public midterm_date_time: string[],
//         public final_date_time: string[],
// 	) {}
// }