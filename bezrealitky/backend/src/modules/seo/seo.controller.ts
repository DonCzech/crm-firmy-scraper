import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller()
export class SeoController {
  constructor(private prisma: PrismaService) {}

  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    const listings = await this.prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });

    const appUrl = process.env.APP_URL ?? 'https://bezrealitky.cz';
    const urls = [
      `<url><loc>${appUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${appUrl}/vyhledat</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      ...listings.map(
        (l) =>
          `<url><loc>${appUrl}/inzerat/${l.slug}</loc><lastmod>${l.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get('robots.txt')
  robots(@Res() res: Response) {
    const appUrl = process.env.APP_URL ?? 'https://bezrealitky.cz';
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${appUrl}/sitemap.xml\n`);
  }
}
