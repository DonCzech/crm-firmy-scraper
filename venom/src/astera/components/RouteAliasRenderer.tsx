import PickACardGame from "@/astera/components/PickACardGame";
import SluzbyPage from "@/astera/components/SluzbyPage";
import { LOCALIZED_ROUTES } from "@/astera/lib/i18n";
import { slugFromRoutePath } from "@/astera/lib/route-overrides";

function routeIdFromPath(path: string) {
  const slug = slugFromRoutePath(path);
  return LOCALIZED_ROUTES.find(route =>
    Object.values(route.slugs).includes(slug as never)
  )?.id;
}

export function renderRouteAliasTarget(path: string) {
  const routeId = routeIdFromPath(path);

  if (routeId === "pick-a-card") return <PickACardGame />;
  if (routeId === "services") return <SluzbyPage />;

  return null;
}
