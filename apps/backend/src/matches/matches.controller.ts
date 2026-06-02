import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMatchDto: Partial<CreateMatchDto>) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Put(':id/close')
  async close(@Param('id') id: string) {
    return this.matchesService.closeMatch(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.matchesService.delete(id);
    return { success: true, message: 'Jogo deletado com sucesso' };
  }

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }
}
