import { Subject } from './Subject.model';

export class CurriculumSubject {
	constructor(
		public subject: Subject,
		public category_id: number,
		public group_id: number,
		public subgroup_id: number,
		public unique_id: string,
		public year: string,
		public normal_flag: string,
		public coop_flag: string,
	) {}
}
