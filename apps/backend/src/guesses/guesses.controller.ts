import { Controller, Get, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { GuessesService } from './guesses.service';
import { CreateGuessDto } from './dto/create-guess.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    nome: string;
  };
}

@Controller('guesses')
@UseGuards(JwtAuthGuard)
export class GuessesController {
  constructor(private readonly guessesService: GuessesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req: AuthenticatedRequest, @Body() createGuessDto: CreateGuessDto) {
    const userId = req.user!.id;
    return this.guessesService.create(userId, createGuessDto);
  }

  @Get('open-matches')
  getOpenMatches(@Request() req: AuthenticatedRequest) {
    const userId = req.user!.id;
    return this.guessesService.getOpenMatches(userId);
  }

  @Get('my-closed-matches')
  getMyClosedMatches(@Request() req: AuthenticatedRequest) {
    const userId = req.user!.id;
    return this.guessesService.getMyClosedMatches(userId);
  }
}
