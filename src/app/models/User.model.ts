export class User {
	constructor(
		public id: string = '',
		public username: string | null = null,
	) {
		this.id = id;
	}
}
