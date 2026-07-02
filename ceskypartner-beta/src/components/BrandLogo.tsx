type BrandLogoProps = {
  className?: string;
  alt?: string;
  linkClassName?: string;
};

export function BrandLogo({ className, alt = 'online-odhad.cz', linkClassName }: BrandLogoProps) {
  return (
    <a href="/" className={linkClassName} aria-label="Hlavní strana">
      <img src="/brand/online-odhad-logo.svg" className={className} alt={alt} />
    </a>
  );
}
