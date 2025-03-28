export class SubjectReviewData {
	constructor(
		public id: number,
		public teachtable: Teachtable,
		public subject_id: string,
		public user_id: number,
		public review: string,
		public rating: number,
		public like: number,
		public created: string,
		public subject_name_en: string,
	) {}
}

export class Teachtable {
	constructor(
		public id: number,
		public year: number,
		public term: number,
	) {}
}
