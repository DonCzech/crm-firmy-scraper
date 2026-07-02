import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ListingStatus, OfferType, EstateType } from '@prisma/client';
import { randomBytes } from 'crypto';

export interface CreateListingInput {
  offerType: OfferType;
  estateType: EstateType;
  title: string;
  description: string;
  price: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  rooms?: string;
  furnished?: boolean;
  parking?: boolean;
  balcony?: boolean;
  cellar?: boolean;
  elevator?: boolean;
  petFriendly?: boolean;
  street?: string;
  city: string;
  district?: string;
  region?: string;
  zip?: string;
  lat?: number;
  lon?: number;
}

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${base}-${randomBytes(4).toString('hex')}`;
  }

  private async geocode(city: string, street?: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const q = [street, city, 'Czech Republic'].filter(Boolean).join(', ');
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'bezrealitky-app/1.0' } });
      const data: any[] = await res.json();
      if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch { /* ignore geocoding errors */ }
    return null;
  }

  async create(ownerId: string, input: CreateListingInput) {
    const coords = (!input.lat && !input.lon)
      ? await this.geocode(input.city, input.street)
      : null;

    return this.prisma.listing.create({
      data: {
        ...input,
        ownerId,
        slug: this.generateSlug(input.title),
        ...(coords && { lat: coords.lat, lon: coords.lon }),
      },
      include: { media: true, owner: { include: { profile: true } } },
    });
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { media: { orderBy: { order: 'asc' } }, owner: { include: { profile: true } } },
    });
    if (!listing) throw new NotFoundException('Inzerát nenalezen');
    return listing;
  }

  async findBySlug(slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: { media: { orderBy: { order: 'asc' } }, owner: { include: { profile: true } } },
    });
    if (!listing) throw new NotFoundException('Inzerát nenalezen');
    await this.prisma.listing.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    return listing;
  }

  async update(id: string, ownerId: string, data: Partial<CreateListingInput>) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Inzerát nenalezen');
    if (listing.ownerId !== ownerId) throw new ForbiddenException('Nemáte oprávnění');

    // Re-geocode if city changed and no explicit coords
    if (data.city && !data.lat && !data.lon) {
      const coords = await this.geocode(data.city, data.street);
      if (coords) { data.lat = coords.lat; data.lon = coords.lon; }
    }

    return this.prisma.listing.update({
      where: { id },
      data,
      include: { media: true, owner: { include: { profile: true } } },
    });
  }

  async publish(id: string, ownerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException();
    if (listing.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.ACTIVE, publishedAt: new Date() },
      include: { media: true },
    });
  }

  async archive(id: string, ownerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException();
    if (listing.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.listing.update({ where: { id }, data: { status: ListingStatus.ARCHIVED } });
  }

  async myListings(ownerId: string) {
    return this.prisma.listing.findMany({
      where: { ownerId },
      include: { media: { where: { isCover: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
