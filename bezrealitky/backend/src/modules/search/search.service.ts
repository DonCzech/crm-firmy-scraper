import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus, OfferType, EstateType, Prisma } from '@prisma/client';

export interface SearchFilters {
  offerType?: OfferType;
  estateType?: EstateType;
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  rooms?: string[];
  furnished?: boolean;
  parking?: boolean;
  balcony?: boolean;
  petFriendly?: boolean;
}

export interface SearchPagination {
  page?: number;
  limit?: number;
}

export interface SearchSort {
  field?: 'price' | 'area' | 'createdAt' | 'viewCount';
  direction?: 'asc' | 'desc';
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchListings(filters: SearchFilters, pagination: SearchPagination, sort: SearchSort) {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      ...(filters.offerType && { offerType: filters.offerType }),
      ...(filters.estateType && { estateType: filters.estateType }),
      ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
      ...(filters.region && { region: filters.region }),
      ...(filters.rooms?.length && { rooms: { in: filters.rooms } }),
      ...(filters.furnished !== undefined && { furnished: filters.furnished }),
      ...(filters.parking !== undefined && { parking: filters.parking }),
      ...(filters.balcony !== undefined && { balcony: filters.balcony }),
      ...(filters.petFriendly !== undefined && { petFriendly: filters.petFriendly }),
      price: {
        ...(filters.priceMin !== undefined && { gte: filters.priceMin }),
        ...(filters.priceMax !== undefined && { lte: filters.priceMax }),
      },
      ...(filters.areaMin !== undefined || filters.areaMax !== undefined
        ? {
            area: {
              ...(filters.areaMin !== undefined && { gte: filters.areaMin }),
              ...(filters.areaMax !== undefined && { lte: filters.areaMax }),
            },
          }
        : {}),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput = sort.field
      ? { [sort.field]: sort.direction ?? 'desc' }
      : { publishedAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { media: { where: { isCover: true }, take: 1 } },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
