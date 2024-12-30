import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dtos/user/updateUser.dto';
import { User } from 'src/entites/user.entity';

export function SwaggerGetProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 프로필 가져오는 API',
      description:
        '어드민 권한이 있는 사용자는 다른 사용자의 프로필을 가져올 수 있습니다. 그 외에는 본인의 프로필만 가져올 수 있습니다.',
    }),
    ApiParam({
      name: 'userId',
      description: '사용자 ID',
      required: false,
      schema: {
        type: 'string',
      },
    }),
    ApiBearerAuth('JWT'),
    ApiResponse({
      status: 200,
      description: '사용자 정보를 성공적으로 반환합니다.',
    }),
    ApiResponse({
      status: 401,
      description: '인증에 실패했습니다.',
    }),
    ApiResponse({
      status: 404,
      description: '해당 ID의 사용자를 찾을 수 없습니다.',
    })
  );
}

export function SwaggerUploadImage() {
  return applyDecorators(
    ApiOperation({ summary: '프로필 이미지 업로드', description: '사용자의 프로필 이미지를 업로드합니다.' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          profileImage: {
            type: 'string',
            format: 'binary',
            description: '업로드할 프로필 이미지 파일',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: '이미지 업로드 성공' }),
    ApiResponse({ status: 400, description: '잘못된 요청 (예: 파일 미전송, 허용되지 않는 파일 형식)' }),
    ApiResponse({ status: 500, description: '서버 에러' })
  );
}

export function SwaggerUpdateUser() {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({
      summary: '사용자 정보 업데이트',
      description: '사용자의 이름, 닉네임, 전화번호, 주소 등 사용자 정보를 업데이트합니다.',
    }),
    ApiBearerAuth('JWT'),
    ApiBody({
      description: '업데이트할 사용자 정보',
      type: UpdateUserDto,
      examples: {
        사용자정보: {
          summary: '사용자 정보만 수정',
          description: '이름, 닉네임, 전화번호만 수정하는 요청 예제입니다.',
          value: {
            user: {
              name: '홍길동',
              nickName: '길동홍',
              phone: '010-1234-5678',
            },
          },
        },
        로컬계정: {
          summary: '로컬 계정만 수정',
          description: '로컬 계정 비밀번호를 변경하는 요청 예제입니다.',
          value: {
            localAccount: {
              email: 'tests@example.com',
              password: 'example123!',
            },
          },
        },
        주소업데이트: {
          summary: '주소만 업데이트',
          description: '기존 주소 정보를 업데이트하는 요청 예제입니다.',
          value: {
            addresses: [
              {
                id: 'c6ca0c4d-8232-4127-b95f-0a4ecfb978ec',
                address: '서울특별시 강남구 테헤란로 123',
                detailAddress: '101호',
                zipCode: '12345',
                city: '서울',
                state: '강남구',
                isDefault: true,
              },
            ],
          },
        },
        주소추가: {
          summary: '새로운 주소만 추가',
          description: '새로운 주소를 추가하는 요청 예제입니다.',
          value: {
            addresses: [
              {
                address: '서울특별시 송파구 올림픽로 300',
                detailAddress: '302호',
                zipCode: '54321',
                city: '서울',
                state: '송파구',
                isDefault: false,
              },
            ],
          },
        },
        주소업데이트추가: {
          summary: '주소 업데이트와 새로운 주소 추가',
          description: '기존 주소를 업데이트하고 새로운 주소를 추가하는 요청 예제입니다.',
          value: {
            addresses: [
              {
                id: 'c6ca0c4d-8232-4127-b95f-0a4ecfb978ec',
                address: '서울특별시 강남구 테헤란로 123',
                detailAddress: '101호',
                zipCode: '12345',
                city: '서울',
                state: '강남구',
                isDefault: true,
              },
              {
                address: '서울특별시 송파구 올림픽로 300',
                detailAddress: '302호',
                zipCode: '54321',
                city: '서울',
                state: '송파구',
                isDefault: false,
              },
            ],
          },
        },
        모든정보: {
          summary: '모든 정보를 수정',
          description: '사용자 정보, 로컬 계정, 주소까지 모두 수정하는 요청 예제입니다.',
          value: {
            user: {
              name: '홍길동',
              nickName: '길동홍',
              phone: '010-9876-5432',
              localAccount: {
                password: 'securePassword123!',
              },
            },
            addresses: [
              {
                id: 'existing-address-id',
                address: '서울특별시 강남구 테헤란로 123',
                detailAddress: '101호',
                zipCode: '12345',
                city: '서울',
                state: '강남구',
                isDefault: true,
              },
              {
                address: '서울특별시 송파구 올림픽로 300',
                detailAddress: '302호',
                zipCode: '54321',
                city: '서울',
                state: '송파구',
                isDefault: false,
              },
            ],
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '사용자 정보가 성공적으로 업데이트됨',
      type: User,
    }),
    ApiResponse({
      status: 404,
      description: '사용자를 찾을 수 없음',
    })
  );
}
