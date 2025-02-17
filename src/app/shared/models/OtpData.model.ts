export class OtpRequest {
	constructor(
		public id: string,
		public referer: string,
	) {}
}

export class OtpVerify {
	constructor(
		public otpa_id: string,
		public otpa_code: string,
	) {}
}
