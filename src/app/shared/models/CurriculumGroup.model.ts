export class CurriculumGroup {
	constructor(
		public id: number,
		public parent_id: number,
		public type: string,
		public name: string,
		public credit: number,
		public children: CurriculumGroup[],
	) {}
}
