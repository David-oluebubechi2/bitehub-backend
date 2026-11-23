import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { Category, Product } from '../common/types';
import { CreateCategoryDto, CreateProductDto, ProductQueryDto, UpdateCategoryDto, UpdateProductDto } from './dto';

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

@Injectable()
export class MenuService {
  constructor(private readonly store: MemoryStore) {}

  categories() {
    return [...this.store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  products(query: ProductQueryDto = {}) {
    let items = [...this.store.products];
    if (query.categoryId) items = items.filter((p) => p.categoryId === query.categoryId);
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (query.available !== undefined) items = items.filter((p) => p.available === query.available);

    switch (query.sort) {
      case 'popular':
        items.sort((a, b) => Number(b.popular) - Number(a.popular) || b.rating - a.rating);
        break;
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }
    return items;
  }

  product(id: string): Product {
    const product = this.store.products.find((p) => p.id === id || p.slug === id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  restaurant() {
    const categories = this.categories();
    return {
      ...this.store.restaurant,
      stats: {
        menuItems: this.store.products.filter((p) => p.available).length,
        categories: categories.filter((c) => c.active).length,
      },
    };
  }

  createCategory(dto: CreateCategoryDto): Category {
    const name = dto.name.trim();
    if (this.store.categories.some((c) => c.slug === slugify(name))) {
      throw new ConflictException('A category with this name already exists');
    }
    const category: Category = {
      id: this.store.makeId('cat-'),
      name,
      slug: slugify(name),
      description: dto.description || '',
      emoji: dto.emoji || 'utensils',
      gradient: dto.gradient || 'from-violet-300 to-purple-500',
      active: dto.active ?? true,
      sortOrder: this.store.categories.length + 1,
    };
    this.store.categories.push(category);
    return category;
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Category {
    const category = this.store.categories.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, {
      ...(dto.name !== undefined && { name: dto.name, slug: slugify(dto.name) }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.emoji !== undefined && { emoji: dto.emoji }),
      ...(dto.gradient !== undefined && { gradient: dto.gradient }),
      ...(dto.active !== undefined && { active: dto.active }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
    });
    return category;
  }

  deleteCategory(id: string) {
    const index = this.store.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException('Category not found');
    if (this.store.products.some((p) => p.categoryId === id)) {
      throw new BadRequestException('Cannot delete a category that still has products');
    }
    this.store.categories.splice(index, 1);
    return { success: true };
  }

  createProduct(dto: CreateProductDto): Product {
    if (!this.store.categories.some((c) => c.id === dto.categoryId)) {
      throw new BadRequestException('Invalid category');
    }
    const name = dto.name.trim();
    const product: Product = {
      id: this.store.makeId('prod-'),
      categoryId: dto.categoryId,
      name,
      slug: slugify(name),
      description: dto.description || `${name} prepared fresh to order.`,
      price: dto.price,
      compareAtPrice: dto.compareAtPrice,
      emoji: dto.emoji || 'utensils',
      gradient: dto.gradient || 'from-violet-300 to-purple-500',
      available: dto.available ?? true,
      popular: dto.popular ?? false,
      rating: 5,
      reviewCount: 0,
      prepTime: dto.prepTime ?? 15,
      tags: dto.tags || [],
      addOns: (dto.addOns || []).map((a, i) => ({ id: `ao-${i}-${Date.now()}`, name: a.name, price: a.price })),
      createdAt: this.store.now(),
    };
    this.store.products.push(product);
    return product;
  }

  updateProduct(id: string, dto: UpdateProductDto): Product {
    const product = this.product(id);
    if (dto.categoryId && !this.store.categories.some((c) => c.id === dto.categoryId)) {
      throw new BadRequestException('Invalid category');
    }
    Object.assign(product, {
      ...(dto.name !== undefined && { name: dto.name, slug: slugify(dto.name) }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.emoji !== undefined && { emoji: dto.emoji }),
      ...(dto.gradient !== undefined && { gradient: dto.gradient }),
      ...(dto.available !== undefined && { available: dto.available }),
      ...(dto.popular !== undefined && { popular: dto.popular }),
      ...(dto.prepTime !== undefined && { prepTime: dto.prepTime }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.addOns !== undefined && {
        addOns: dto.addOns.map((a, i) => ({ id: `ao-${i}-${Date.now()}`, name: a.name, price: a.price })),
      }),
    });
    return product;
  }

  deleteProduct(id: string) {
    const product = this.product(id);
    this.store.products.splice(this.store.products.indexOf(product), 1);
    return { success: true };
  }
}
