import { Injectable } from '@nestjs/common';
import { CreateLeavesSystemDto } from './dto/create-leaves-system.dto';
import { UpdateLeavesSystemDto } from './dto/update-leaves-system.dto';

@Injectable()
export class LeavesSystemService {
  create(createLeavesSystemDto: CreateLeavesSystemDto) {
    return 'This action adds a new leavesSystem';
  }

  findAll() {
    return `This action returns all leavesSystem`
  }

  findOne(id: number) {
    return `This action returns a #${id} leavesSystem`;
  }

  update(id: number, updateLeavesSystemDto: UpdateLeavesSystemDto) {
    return `This action updates a #${id} leavesSystem`;
  }

  remove(id: number) {
    return `This action removes a #${id} leavesSystem`;
  }
}
