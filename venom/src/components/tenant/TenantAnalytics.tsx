import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

export function TenantAnalytics({ tenant }: Props) {
  const cfg = tenant.analytics_config ?? {};
  const gtmId = cfg.gtm_id;
  const ga4Id = cfg.ga4_id;
  const fbPixelId = cfg.fb_pixel_id;
  const scVerification = tenant.search_console_verification;

  return (
    <>
      {/* Search Console verification */}
      {scVerification && (
        <meta name="google-site-verification" content={scVerification} />
      )}

      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          {/* GTM noscript — must be placed in <body>, rendered via separate BodyGtm */}
        </>
      )}

      {/* Google Analytics 4 (standalone, without GTM) */}
      {ga4Id && !gtmId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
            }}
          />
        </>
      )}

      {/* Meta Pixel */}
      {fbPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`,
          }}
        />
      )}
    </>
  );
}

export function GtmNoScript({ gtmId }: { gtmId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
