import { CurriculumType } from './CurriculumType.model';

export class Curriculum {
	constructor(
		public id: number,
		public curriculum_type: CurriculumType | null,
		public year: number,
		public name_th: string,
		public name_en: string,
	) {}
}
