export class SubjectReviewData {
	constructor(
		public student_id: number,
		public year: number,
		public term: number,
		public subject_id: string,
		public subject_name_en: string,
		public review: string,
		public rating: number,
		public create_date: string,
	) {}
}
