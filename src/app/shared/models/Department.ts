import { Faculty } from './Faculty';

export class Department {
	constructor(
		public id: number,
		public kmitl_id: string,
		public faculty: Faculty | null,
		public name_th: string,
		public name_en: string,
	) {}
}
