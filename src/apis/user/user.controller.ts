import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser, CurrentUserRole } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { SwaggerGetProfile, SwaggerUpdateUser } from 'src/common/swaggers/user.swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decoratort';
import { UpdateUserWithDTOs } from 'src/common/dtos/user/updateUser.dto';
import { CustomWinstonLogger } from 'src/logger/logger.service';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class UserController {
  private readonly contextName = UserController.name;
  constructor(
    private readonly userService: UserService,
    private readonly logger: CustomWinstonLogger
  ) {}

  @Get(':userId?')
  @SwaggerGetProfile()
  @Roles(UserRole.USER, UserRole.ADMIN)
  async getUser(
    @CurrentUser() userId: string,
    @CurrentUserRole() role: UserRole,
    @Param('userId') paramUserId?: string
  ) {
    this.logger.log('사용자 정보 조회', this.contextName);
    if (role === UserRole.ADMIN) {
      // 관리자 권한으로 다른 사용자 정보 조회
      if (paramUserId) return await this.userService.findUserById(paramUserId);
      return await this.userService.findUserById(userId);
    }
    return await this.userService.findUserById(userId);
  }

  @Get('admin/users')
  @Roles(UserRole.ADMIN)
  async getUsers() {
    return await this.userService.findUsers();
  }

  @Put()
  @SwaggerUpdateUser()
  async updateUser(@CurrentUser() userId: string, @Body() updateUserDto: UpdateUserWithDTOs) {
    this.logger.log(`사용자 정보 수정 API 활성화`, this.contextName);
    return await this.userService.updateUser(userId, updateUserDto);
  }
}
