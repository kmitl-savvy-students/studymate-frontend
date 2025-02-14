import { Subject } from './Subject.model';

export class SubjectCardData {
	constructor(
		public subject: Subject,

		public class_level: string,
		public group_name: string[],

		public section: number,
		public building_name: string | null, // classbuilding
		public room_number: string | null, // room_no

		public teacher_list_th: string[],
		public teacher_list_en: string[],

		public class_datetime: string[], // classdatetime
		public midterm_datetime: string[], // midterm_date_time
		public final_datetime: string[], // final_date_time

		public rating: number,

		public session_type: string, //lect_or_prac
		public rule: string | null,
		public remark: string,
	) {}
}
