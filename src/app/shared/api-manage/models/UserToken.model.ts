import { User } from './User.model';

export class UserToken {
	constructor(
		public id: string,
		public user: User,
		public created: string,
		public expired: string,
	) {}
}
