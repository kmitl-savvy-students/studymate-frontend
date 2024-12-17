import { Curriculum } from './Curriculum.model';
import { User } from './User.model';

export class Transcript {
	constructor(
		public id: number,
		public created: string,
		public user?: User,
		public curriculum?: Curriculum,
	) {}
}
