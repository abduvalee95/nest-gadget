import { Module } from '@nestjs/common';
import {MemberModule} from './member/member.module'
import {GadgetModule} from './gadget/gadget.module'

@Module({
    imports:[MemberModule, GadgetModule]
})

export class ComponentsModule{}