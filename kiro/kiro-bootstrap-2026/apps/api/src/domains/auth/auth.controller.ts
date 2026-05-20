import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { PasswordRecoveryService } from './password-recovery.service';
import { SessionService } from './session.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser, type CurrentUserData } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  type LoginDto,
  type RegisterDto,
  type RefreshTokenDto,
} from './dto/auth.dto';

interface HttpRequest {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly sessionService: SessionService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async register(@Body() body: RegisterDto, @Req() req: HttpRequest) {
    const dto = RegisterSchema.parse(body);
    return this.authService.register(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 900000 } })
  async login(@Body() body: LoginDto, @Req() req: HttpRequest) {
    const dto = LoginSchema.parse(body);
    return this.authService.login(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto, @Req() req: HttpRequest) {
    const { refreshToken } = RefreshTokenSchema.parse(body);
    return this.authService.refresh(refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: CurrentUserData) {
    await this.authService.logout(user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser() user: CurrentUserData) {
    await this.authService.logoutAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: CurrentUserData) {
    // Fetch full user data from DB (JWT only has id, email, roles)
    const fullUser = await this.authService.getMe(user.id);
    return fullUser;
  }

  // ── Password Recovery ──────────────────────────────────────

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() body: { email: string }) {
    await this.passwordRecoveryService.requestReset(body.email);
    return { message: 'Si el email existe, recibirás un enlace de recuperación' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.passwordRecoveryService.resetPassword(body.token, body.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  // ── Active Sessions ──────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: CurrentUserData) {
    return this.sessionService.getActiveSessions(user.id, user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.sessionService.revokeUserSession(user.id, sessionId);
  }
}
