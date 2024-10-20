import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private userToken: string | null = null;
	public tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
		string | null
	>(null);

	setToken(token: string): void {
		this.userToken = token;
		sessionStorage.setItem('userToken', token); // เก็บ Token ใน sessionStorage
		this.tokenSubject.next(token); // แจ้งให้ผู้สังเกตการณ์รู้ว่า Token เปลี่ยน
	}
	getToken(): string | null {
		if (!this.userToken) {
			this.userToken = sessionStorage.getItem('userToken'); // ดึง Token จาก sessionStorage ถ้ามี
			this.tokenSubject.next(this.userToken); // อัปเดตค่าเมื่อดึงจาก sessionStorage
		}
		return this.userToken;
	}
	clearToken(): void {
		this.userToken = null;
		sessionStorage.removeItem('userToken'); // ลบ Token จาก sessionStorage
		this.tokenSubject.next(null); // แจ้งว่าลบ Token แล้ว
	}
}
