import { CurriculumSubject } from './CurriculumSubject.model';

export class CurriculumSubgroup {
	constructor(
		public category_id: number,
		public group_id: number,
		public subgroup_id: number,
		public unique_id: string,
		public year: string,
		public subgroup_name: string,
		public credit1: number,
		public credit2: number,
		public condition: string,
		public link: string,
		public curriculum_subjects: CurriculumSubject[],
		public isOpen: boolean,
	) {}
}
