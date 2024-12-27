import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from 'src/entites/user.entity';
import { SignUpDto } from '../dtos/authentication/createLocalAccount.dto';

export function SwaggerSignup() {
  return applyDecorators(
    ApiOperation({
      summary: '회원가입 API',
      description: '회원 정보를 받아 회원가입을 처리하는 로직입니다.',
    }),
    ApiResponse({
      status: 201,
      description: '회원가입에 성공하였습니다.',
      type: User,
    }),
    ApiResponse({
      status: 400,
      description: '이미 사용하고 있는 이메일 입니다.',
    }),
    ApiBody({
      type: SignUpDto,
    })
  );
}
