import { Department } from './Department';

export class Program {
	constructor(
		public id: number,
		public kmitl_id: string,
		public department: Department | null,
		public name_th: string,
		public name_en: string,
	) {}
}
