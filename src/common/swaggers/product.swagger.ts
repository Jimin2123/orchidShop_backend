import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFullProductDTO } from '../dtos/product/create-product.dto';

export function SwaggerCreateProduct() {
  return applyDecorators(
    ApiTags('Product'),
    ApiOperation({
      summary: 'Create a new product with images and additional data',
      description: 'Uploads product data, discounts, tags, and images.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Create a product with related data',
      type: CreateFullProductDTO,
      examples: {
        example1: {
          summary: 'Complete product data example',
          value: {
            product: {
              name: 'Smartphone',
              description: 'A high-end smartphone',
              price: 999.99,
              quantity: 100,
              categoryId: '873a29b3-7e2b-4bf8-8b31-ff074f86c3f7',
            },
            discounts: [
              {
                type: 'PERCENTAGE',
                discountRate: 15.5,
                value: 50,
                startDate: '2024-01-01T00:00:00Z',
                endDate: '2024-12-31T23:59:59Z',
                isActive: true,
              },
            ],
            tags: ['tag1-id', 'tag2-id'],
            images: ['file1.png', 'file2.png'],
          },
        },
      },
    })
  );
}
