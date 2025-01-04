import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTagsDto } from 'src/common/dtos/tags/create-tag.dto';
import { UpdateTagDto, UpdateTagsDto } from 'src/common/dtos/tags/update-tag.dto';
import { TransactionUtil } from 'src/common/utils/transcation.util';
import { Tag } from 'src/entites/tag.entity';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource,
    private readonly transactionUtil: TransactionUtil
  ) {}

  async createTags(createTagsDto: CreateTagsDto) {
    const tags = createTagsDto.tags;
    // 중복 태그 확인
    const existingTags = await this.tagRepository.findBy({
      name: In(tags.map((tag) => tag.name)), // 배열을 In 연산자로 전달
    });

    // 중복 태그가 존재하면 예외 발생
    if (existingTags.length > 0) {
      const existingNames = existingTags.map((tag) => tag.name).join(', ');
      throw new BadRequestException(`이미 존재하는 태그입니다: ${existingNames}`);
    }

    // 태그 생성
    const newTags = this.tagRepository.create(existingTags);
    return await this.tagRepository.save(newTags);
  }

  async getTags() {
    return await this.tagRepository.find();
  }

  async getTag(id: string): Promise<Tag> {
    const tag = await this.validateTag(id);
    return tag;
  }

  async updateTags(updateTagsDto: UpdateTagsDto): Promise<Tag[]> {
    return await this.transactionUtil.runInTransaction(this.dataSource, async (queryRunner: QueryRunner) => {
      const tagRepository = queryRunner.manager.getRepository(Tag);

      const updatedTags: Tag[] = [];

      for (const tagDto of updateTagsDto.tags) {
        // 태그 ID가 있는 경우 업데이트
        if (tagDto.id) {
          const validateTag = await this.validateTag(tagDto.id);

          Object.assign(validateTag, tagDto);
          const updatedTag = await tagRepository.save(validateTag);
          updatedTags.push(updatedTag);
        }
      }

      return updatedTags;
    });
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto): Promise<void> {
    await this.validateTag(id);
    await this.tagRepository.update(id, updateTagDto);
  }

  async deleteTag(id: string): Promise<void> {
    await this.validateTag(id); // 태그 존재 여부 확인
    const result = await this.tagRepository.delete(id); // id로 바로 삭제
    if (result.affected === 0) {
      throw new InternalServerErrorException('태그 삭제에 실패했습니다.');
    }
  }

  private async validateTag(id: string): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({ where: { id } });
    if (!existingTag) {
      throw new NotFoundException('태그가 존재하지 않습니다.');
    }
    return existingTag;
  }
}
