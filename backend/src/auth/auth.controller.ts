import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test-email')
  @ApiOperation({ summary: 'Test email sending (DEBUG)' })
  async testEmail() {
    try {
      const result = await this.authService.testEmail();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Test email failed',
        error: error.message
      };
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 password changes per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (including first login)' })
  async changePassword(@Body() dto: ChangePasswordDto, @Headers('authorization') authHeader?: string) {
    const bearerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : dto.tempToken;
    return this.authService.changePassword(dto.userId, dto.oldPassword, dto.newPassword, bearerToken);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 resets per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refreshes per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 logouts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }
}
