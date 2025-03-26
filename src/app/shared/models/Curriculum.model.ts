import { CurriculumGroup } from './CurriculumGroup.model';
import { Program } from './Program.model';

export class Curriculum {
	constructor(
		public id: number,
		public is_visible: boolean,
		public program: Program | null,
		public year: number,
		public name_th: string,
		public name_en: string,
		public curriculum_group: CurriculumGroup | null,
	) {}
}
