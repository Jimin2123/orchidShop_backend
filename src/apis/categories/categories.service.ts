import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoriesDto } from 'src/common/dtos/categories/create-category.dto';
import { UpdateCategoriesDto } from 'src/common/dtos/categories/update-category.dto';
import { Category } from 'src/entites/categories.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async createCategories(createCategoriesDto: CreateCategoriesDto): Promise<Category[]> {
    const { categories } = createCategoriesDto;

    // 결과를 저장할 배열
    const createdCategories: Category[] = [];

    for (const dto of categories) {
      const { name, description, parentId } = dto;

      // 1. 상위 카테고리 확인
      let parentCategory: Category | null = null;
      if (parentId) {
        parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new Error(`Parent category with ID ${parentId} not found.`);
        }
      }

      // 2. 새 카테고리 생성
      const newCategory = this.categoryRepository.create({
        name,
        description,
        parent: parentCategory,
      });

      // 3. 저장
      const savedCategory = await this.categoryRepository.save(newCategory);

      // 4. 결과 배열에 추가
      createdCategories.push(savedCategory);
    }

    return createdCategories;
  }

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async updateCategories(updateCategoriesDto: UpdateCategoriesDto): Promise<Category[]> {
    const updatedCategories: Category[] = [];

    for (const updateCategoryDto of updateCategoriesDto.categories) {
      const { id, parentId, ...updateFields } = updateCategoryDto;

      // 1. 기존 엔티티 조회
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // 2. 상위 카테고리 설정
      if (parentId) {
        const parentCategory = await this.categoryRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new Error(`Parent category with ID ${parentId} not found`);
        }
        category.parent = parentCategory; // 관계 설정
      } else {
        category.parent = null; // 상위 카테고리 제거
      }

      // 2. DTO에 포함된 값만 업데이트
      Object.assign(category, updateFields);

      // 3. 저장
      const updatedCategory = await this.categoryRepository.save(category);
      updatedCategories.push(updatedCategory);
    }

    return updatedCategories;
  }
}
