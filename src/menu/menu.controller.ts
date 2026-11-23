import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';
import { MenuService } from './menu.service';
import { CreateCategoryDto, CreateProductDto, ProductQueryDto, UpdateCategoryDto, UpdateProductDto } from './dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Public()
  @Get('restaurant')
  restaurant() {
    return this.menu.restaurant();
  }

  @Public()
  @Get('categories')
  categories() {
    return this.menu.categories();
  }

  @Post('categories')
  @Roles('ADMIN')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menu.createCategory(dto);
  }

  @Patch('categories/:id')
  @Roles('ADMIN')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.menu.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('ADMIN')
  deleteCategory(@Param('id') id: string) {
    return this.menu.deleteCategory(id);
  }

  @Public()
  @Get('products')
  products(@Query() query: ProductQueryDto) {
    return this.menu.products(query);
  }

  @Public()
  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.menu.product(id);
  }

  @Post('products')
  @Roles('ADMIN')
  createProduct(@Body() dto: CreateProductDto) {
    return this.menu.createProduct(dto);
  }

  @Patch('products/:id')
  @Roles('ADMIN')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.menu.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles('ADMIN')
  deleteProduct(@Param('id') id: string) {
    return this.menu.deleteProduct(id);
  }
}
