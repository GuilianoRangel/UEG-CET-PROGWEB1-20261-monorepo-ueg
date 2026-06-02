import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GuessesService } from './guesses.service';
import { CreateGuessDto } from './dto/create-guess.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('guesses')
@UseGuards(JwtAuthGuard)
export class GuessesController {
  constructor(private readonly guessesService: GuessesService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() createGuessDto: CreateGuessDto,
  ) {
    return this.guessesService.create(user.id, createGuessDto);
  }

  @Get('open-matches')
  async findOpenMatches(@CurrentUser() user: { id: string }) {
    return this.guessesService.findOpenMatches(user.id);
  }

  @Get('my-closed-matches')
  async findMyClosedMatches(@CurrentUser() user: { id: string }) {
    return this.guessesService.findMyClosedMatches(user.id);
  }
}
