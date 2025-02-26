import { CurriculumGroup } from './CurriculumGroup.model';
import { Subject } from './Subject.model';

export class SubjectCardData {
	constructor(
		public subject: Subject,
		public class_level: string,
		public group_name: CurriculumGroup[],
		public section: number,
		public credit_lps: string,
		public building_name: string | null,
		public room_number: string | null,
		public teacher_list_th: string[],
		public teacher_list_en: string[],
		public class_datetime: string[],
		public midterm_datetime: string[],
		public final_datetime: string[],
		public rating: number,
		public review: number,
		public session_type: string,
		public rule: string | null,
		public remark: string | null,
	) {}
}
