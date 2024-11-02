export class Subject {
	constructor(
		public id: string,
		public subject_tname: string,
		public subject_ename: string,
		public credit: number,
		public lect_hr: number,
		public prac_hr: number,
		public prerequisite: string,
		public detail: string,
		public self_hr: number,
		public prerequisite2: string,
		public lock_ed: number,
		public precondition: number,
		public status: string,
		public subject_type: string,
		public prerequisite3: string,
		public prerequisite4: string,
		public prerequisite5: string,
		public last_modified: string,
	) {}
}
