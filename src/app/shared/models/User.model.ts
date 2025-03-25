import { Curriculum } from './Curriculum.model';

export class User {
	constructor(
		public id: string,
		public password: string,
		public nickname: string,
		public firstname: string,
		public lastname: string,
		public profile_picture: string,
		public is_admin: string,
		public curriculum: Curriculum,
		public view_policy: number,
	) {}
}
