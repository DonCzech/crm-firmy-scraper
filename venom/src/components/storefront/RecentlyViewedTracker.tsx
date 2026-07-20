"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "./RecentlyViewed";

interface Props {
  tenantSlug: string;
  slug: string;
  title: string;
  price: string;
  image?: string;
}

export function RecentlyViewedTracker({ tenantSlug, slug, title, price, image }: Props) {
  useEffect(() => {
    trackRecentlyViewed(tenantSlug, { slug, title, price, image });
  }, [tenantSlug, slug, title, price, image]);

  return null;
}
