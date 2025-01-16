import { CurriculumSubgroup } from './CurriculumSubgroup.model';

export class CurriculumGroup {
	constructor(
		public category_id: number,
		public group_id: number,
		public curriculum_id: string,
		public year: string,
		public group_name: string,
		public credit1: number,
		public credit2: number,
		public subgroup_flag: string,
		public condition: string,
		public link: string,
		public curriculum_subgroup: CurriculumSubgroup[],
		public isOpen: boolean,
	) {}
}
