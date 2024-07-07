import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService} from '@nestjs/jwt'
import { Member } from '../../libs/dto/member/member'
import { T } from '../../libs/types/common'
import { shapeIntoMongoObjectId } from '../../libs/config'

@Injectable()
export class AuthService {
constructor(private jwtService: JwtService){}


	public async hashPassword(memberPasword: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(memberPasword, salt);
	}

	public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}
	public async createToken(member: Member): Promise<string> {
		const payload: T = {};
		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});
		delete payload.memberPassword;

		return await this.jwtService.signAsync(payload);
	}

	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token); // Tokenga yuklagan qiymatmiz member osha memberni qiymatni olib berdi, vaqtniham verify qilyabmiz
		member._id = shapeIntoMongoObjectId(member._id);
		return member;
	}

}
