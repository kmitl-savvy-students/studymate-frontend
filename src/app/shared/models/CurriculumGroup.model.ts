import { CurriculumGroupSubject } from './CurriculumGroupSubject';

export class CurriculumGroup {
	constructor(
		public id: number,
		public parent_id: number,
		public type: string,
		public name: string,
		public credit: number,
		public color: string,
		public children: CurriculumGroup[],
		public subjects: CurriculumGroupSubject[],
	) {}
}
