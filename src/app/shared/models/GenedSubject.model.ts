import { GenedGroup } from './GenedGroup.model';
import { Subject } from './Subject.model';

export class GenedSubject {
	constructor(
		public subject: Subject,
		public group: GenedGroup,
	) {}
}
