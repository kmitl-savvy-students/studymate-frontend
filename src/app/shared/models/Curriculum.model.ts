export class Curriculum {
	constructor(
		public id: number,
		public unique_id: string,
		public year: string,
		public name_th: string,
		public name_en: string,
		public degree_name_th: string,
		public degree_name_th_short: string,
		public degree_name_en: string,
		public degree_name_en_short: string,
		public pid: string,
	) {}
}
