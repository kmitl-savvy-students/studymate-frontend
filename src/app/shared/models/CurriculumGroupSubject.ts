import { CurriculumGroup } from './CurriculumGroup.model';
import { Subject } from './Subject.model';

export class CurriculumGroupSubject {
	constructor(
		public id: number,
		public curriculum_group: CurriculumGroup | null,
		public subject: Subject | null,
		public subject_string: string,
	) {}
}
