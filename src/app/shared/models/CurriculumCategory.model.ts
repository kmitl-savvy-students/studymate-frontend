import { CurriculumGroup } from './CurriculumGroup.model';

export class CurriculumCategory {
	constructor(
		public c_cat_id: number,
		public curri_id: number,
		public year: string,
		public credit1: number,
		public credit2: number,
		public curriculum_groups: CurriculumGroup[],
		public isOpen: boolean,
	) {}
}
