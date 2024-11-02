import { User } from './User';

export class UserToken {
	constructor(
		public id: string,
		public userId: string,
		public created: string,
		public expired: string,
	) {}
}
