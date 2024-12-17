import { Subject } from './Subject.model';
import { Transcript } from './Transcript.model';

export class TranscriptData {
	constructor(
		public id: number,
		public semester: number,
		public year: number,
		public grade: string,
		public credit: number,
		public transcript?: Transcript,
		public subject?: Subject,
	) {}
}
