import { Subject } from './Subject.model';
import { Teachtable } from './Teachtable.model';
import { Transcript } from './Transcript.model';

export class TranscriptDetail {
	constructor(
		public id: number,
		public transcript: Transcript | null,
		public subject: Subject | null,
		public teachtable: Teachtable | null,
		public grade: string,
	) {}
}
