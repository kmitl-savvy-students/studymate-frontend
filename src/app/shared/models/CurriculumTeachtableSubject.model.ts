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
