import { Curriculum } from './Curriculum.model';

export class User {
	constructor(
		public id: string,
		public password: string,
		public name_nick: string,
		public name_first: string,
		public name_last: string,
		public profile: string,
		public curriculum: Curriculum,
	) {}
}
