export class Subject {
	constructor(
		public id: string,
		public name_th: string,
		public name_en: string,
		public credit: number,
		public detail: string,
	) {}
}

export class SubjectRatingReview extends Subject {
	constructor(
		id: string,
		name_th: string,
		name_en: string,
		credit: number,
		detail: string,
		public rating: number,
		public review: number,
	) {
		super(id, name_th, name_en, credit, detail);
	}
}
