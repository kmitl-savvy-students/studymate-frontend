export enum EnumGender {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export class User {
	constructor(
		public id: string,
		public password: string,
		public gender: EnumGender,
		public nameNick: string,
		public nameFirst: string,
		public nameLast: string,
		public profile: string,
	) {}
}
