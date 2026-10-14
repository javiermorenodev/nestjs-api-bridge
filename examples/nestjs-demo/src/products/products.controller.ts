import { Controller, Get, Query } from '@nestjs/common';
import { ProductFilterDto } from './dto/product-filter.dto';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

@Controller('products')
export class ProductsController {
  private readonly products: Product[] = [
    { id: 1, name: 'Keyboard', category: 'hardware', price: 80 },
    { id: 2, name: 'Notebook', category: 'stationery', price: 5 },
  ];

  @Get()
  async findAll(@Query() filter: ProductFilterDto): Promise<Product[]> {
    return this.products.filter((product) => this.matches(product, filter));
  }

  private matches(product: Product, filter: ProductFilterDto): boolean {
    if (filter.search && !product.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.category && product.category !== filter.category) {
      return false;
    }
    if (filter.maxPrice && product.price > Number(filter.maxPrice)) {
      return false;
    }
    return true;
  }
}
