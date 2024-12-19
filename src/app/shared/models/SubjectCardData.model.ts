export class SubjectCardData {
	constructor(
		public classLevel: string,
		public subject_type_name_th: string,
		public subject_type_name_en: string,
		public subject_id: string,
		public credit: number,
		public section: number,
		public credit_lps: string,
		public subject_name_th: string,
		public subject_name_en: string,
		public subject_type_name: string | null,
		public subject_subtype_name: string | null,
		public classdatetime: string[],
		public classbuilding: string | null,
		public room_no: string | null,
		public rule: string | null,
		public teacher_list_th: string[],
		public teacher_list_en: string[],
		public lect_or_prac: string,
		public midterm_date_time: string[],
		public final_date_time: string[],
		public interested: number,
		public rating: number,
	) {}
}
