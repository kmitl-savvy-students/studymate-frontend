export class SubjectCardData {
	constructor(
		public subject_id: string,
		public subject_type_name: string,
		public subject_name_th: string,
		public subject_name_en: string,
		public credit: number,
		public section: number,
		public classdatetime: string[], // Array of strings for the schedule
		public teacher_list_th: string[], // Array of teacher names in Thai
		public teacher_list_en: string[], // Array of teacher names in English
		public room_no: string,
		public classbuilding : string,
		public rule: string, // Rule in HTML format
		public review_score: number,
		public review_total: number,
		public student_total: number
	) {}
}
