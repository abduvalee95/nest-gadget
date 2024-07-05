import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
	public async signup(): Promise<string> {
		return 'SignUp, Exucuted'
	}
	public async login(): Promise<string> {
		return 'login executed';
	}

	public async updateMember(): Promise<string> {
		return 'updateMember executed';
	}

	public async getMethod(): Promise<string> {
		return 'getMethod executed';
	}
}
