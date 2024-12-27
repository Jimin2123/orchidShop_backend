import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LocalAccountDto, SignUpDto } from '../dtos/authentication/createLocalAccount.dto';

export function SwaggerSignup() {
  return applyDecorators(
    ApiOperation({
      summary: '회원가입 API',
      description: '회원 정보를 받아 회원가입을 처리하는 로직입니다.',
    }),
    ApiResponse({
      status: 201,
      description: '회원가입에 성공하였습니다.',
    }),
    ApiResponse({
      status: 400,
      description: '이미 사용하고 있는 이메일 입니다. || 이미 사용하고 있는 닉네임 입니다.',
    }),
    ApiBody({
      type: SignUpDto,
    })
  );
}

export function SwaggerLogin() {
  return applyDecorators(
    ApiOperation({
      summary: '로그인 API',
      description: `
        사용자 인증을 처리하는 API입니다.
        - **요청 본문:** 이메일과 비밀번호를 포함해야 합니다.
        - **응답:** 성공 시 JWT 액세스 토큰 반환.
      `,
    }),
    ApiBody({
      description: '로그인 요청 데이터',
      type: LocalAccountDto, // 요청 DTO 정의
    }),
    ApiResponse({
      status: 200,
      description: '로그인 성공. JWT 토큰 반환.',
    }),
    ApiResponse({
      status: 401,
      description: '인증 실패. 잘못된 이메일 또는 비밀번호.',
    }),
    ApiResponse({
      status: 400,
      description: '잘못된 요청 데이터.',
    })
  );
}
