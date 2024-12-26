export class SubjectReviewData {
	constructor(
		public id: number,
		public teachtable_subject: TeachtableSubject,
		public user_id: string,
		public review: string,
		public rating: number,
		public like: number,
		public created: string,
		public subject_name_en: string,
	) {}
}

export class TeachtableSubject {
	constructor(
		public id: number,
		public teachtable: Teachtable,
		public subject_id: string,
		public interested: number,
		public count_of_review: number,
		public rating: number,
	) {}
}

export class Teachtable {
	constructor(
		public id: number,
		public academic_year: number,
		public academic_term: number,
	) {}
}
