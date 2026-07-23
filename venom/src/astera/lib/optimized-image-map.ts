export type OptimizedImageEntry = {
  webp: string;
  fallback: string;
  webpSrcSet?: string;
  fallbackSrcSet?: string;
  width: number;
  height: number;
  lqip?: string;
};

export const OPTIMIZED_IMAGE_MAP: Record<string, OptimizedImageEntry> = {
  "/images/3rd-part-logo-asset-11.jpg": {
    "webp": "/optimized/images/3rd-part-logo-asset-11.webp",
    "fallback": "/optimized/images/3rd-part-logo-asset-11.jpg",
    "webpSrcSet": "/optimized/images/3rd-part-logo-asset-11-331w.webp 331w, /optimized/images/3rd-part-logo-asset-11-480w.webp 480w, /optimized/images/3rd-part-logo-asset-11-662w.webp 662w, /optimized/images/3rd-part-logo-asset-11-664w.webp 664w",
    "fallbackSrcSet": "/optimized/images/3rd-part-logo-asset-11-331w.jpg 331w, /optimized/images/3rd-part-logo-asset-11-480w.jpg 480w, /optimized/images/3rd-part-logo-asset-11-662w.jpg 662w, /optimized/images/3rd-part-logo-asset-11-664w.jpg 664w",
    "width": 664,
    "height": 122,
    "lqip": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAACwAwCdASowAAkAPu1krE4ppaSiKqwBMB2JaQAAN43KjZ7Mys1dMAD+5/mrwP5ZWuE9eXHPLDy+tGlYks7oNa/zrxu5RiGy+AAAAA=="
  },
  "/images/3rd-part-logo-asset-22.jpg": {
    "webp": "/optimized/images/3rd-part-logo-asset-22.webp",
    "fallback": "/optimized/images/3rd-part-logo-asset-22.jpg",
    "webpSrcSet": "/optimized/images/3rd-part-logo-asset-22-331w.webp 331w, /optimized/images/3rd-part-logo-asset-22-480w.webp 480w, /optimized/images/3rd-part-logo-asset-22-662w.webp 662w, /optimized/images/3rd-part-logo-asset-22-664w.webp 664w",
    "fallbackSrcSet": "/optimized/images/3rd-part-logo-asset-22-331w.jpg 331w, /optimized/images/3rd-part-logo-asset-22-480w.jpg 480w, /optimized/images/3rd-part-logo-asset-22-662w.jpg 662w, /optimized/images/3rd-part-logo-asset-22-664w.jpg 664w",
    "width": 664,
    "height": 122,
    "lqip": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACQAwCdASowAAkALrV2u12jqampiYC0S0gAB3iTZNJhI7hPSEoAAP70Ro4VQpnvn80XtUw/tHCyc8G/oESBVZp6ze/0veAAAAA="
  },
  "/images/408x410-OracleSecretsWebinar-Event-Promo.jpg": {
    "webp": "/optimized/images/408x410-OracleSecretsWebinar-Event-Promo.webp",
    "fallback": "/optimized/images/408x410-OracleSecretsWebinar-Event-Promo.jpg",
    "webpSrcSet": "/optimized/images/408x410-OracleSecretsWebinar-Event-Promo-331w.webp 331w, /optimized/images/408x410-OracleSecretsWebinar-Event-Promo-408w.webp 408w",
    "fallbackSrcSet": "/optimized/images/408x410-OracleSecretsWebinar-Event-Promo-331w.jpg 331w, /optimized/images/408x410-OracleSecretsWebinar-Event-Promo-408w.jpg 408w",
    "width": 408,
    "height": 410,
    "lqip": "data:image/webp;base64,UklGRu4AAABXRUJQVlA4IOIAAABwCACdASowADAAPuVgpk2pJaOiONSYASAciWMAtvwTwXdXoiz1svB4ZF44/sW5Vu32WOg1dXgZ0Q1AkOiCUbd6WqLgrpr1/32DBYIAAP61gltwCsqj1p0LIZ+ww9OlRA8kvEhfWNjl9ITTdNoNahs9nLUIQcC18xTAnFwjy1eUzQ0nyna0wm19Qsy64JxGqMXgxs8LwSAfrWIMr4YgLlpbuTv+4zbqwyihcGG9Oi17zBLni7eicX5eE7Qkz18xdlJscK/n3ys3vnkoJmguYcsEfNkwXxobsMzykEVHv+WqRYAA"
  },
  "/images/CBR-logo-black.png": {
    "webp": "/optimized/images/CBR-logo-black.webp",
    "fallback": "/optimized/images/CBR-logo-black.png",
    "webpSrcSet": "/optimized/images/CBR-logo-black-102w.webp 102w",
    "fallbackSrcSet": "/optimized/images/CBR-logo-black-102w.png 102w",
    "width": 102,
    "height": 94,
    "lqip": "data:image/webp;base64,UklGRlIFAABXRUJQVlA4WAoAAAAQAAAALwAAKwAAQUxQSB0EAAANGYUAAqCgieh/nIu8Ztvk2rZtW0PrMaaeE2rhvz9zIoW01nOCproJPwqUBnQ+hwGF/CxIMaMbkCjYP0UxoxmQJBwoBgxeHQgSfFYzKoqYgAl4LR75uje8JfpN2X/zF382/wkg/2r7k7+Lt0V0JvECGbA/+oWf+qEf+JGfuRlAvuNLvu77vuubvuZz3gcrewEBqf7BY3QnCMi2P/idmyPf864z3ExPoEC3MvZxjo6AqNqef+/5snCcH2iU6XGi3A3M7qRLgAiry2Wb0/K47nTTI0TJheBomHCXjO7Rsnl5Xn6eB930CIECsiE8mux9hOarrcaxU/6A4GDmkQHXowCQ3Wm3y+p9h/weCYwcnak1lz8BQPTQ7bJyDEp3XMhsWMWeWusBJuEuIMdIv1wsOgQAEphptTYe18by+7JTtgR2k4TfFiL9DhiQzXXT/rGDpTuy3gdqCpnSGifXbWZSgAjAzLXE88jCXRc64U6m1oV9bZsuJgCQMFcEJDFwbxEAFMpcm+XeiqRLgEBSHm1DtpXHHSFRxnFF2DY1ojxGo+gQIwAB1cAqEAA9M9atxlDMafvuzzP39rAMMRMGMAbWZgMgzMdA3VaQWMtH2hQSQCKZGTKV9R5rIShGKZJaZlvY8h6aGscoK7Fz0CvmtB4tz+hALURkBLdLbKVrmvU4zMstshtVqCp2oHsP2s0jFTHyMnnz65kT+5G2JHonfIUgQEAkSC2SXrjuSlScZxX3nM+2D6pl5lSO8DIFXSy0ZMuHxZE4T5QN2L/WOM5YubaZYO9DC1MOxOrdzAq87dfjGG0zZHPL85CD220RiCTktU3P1jGwtkrWee6jaxoA9eBtKWzehLshwm8TnRida1bDujsBMzPHSC1xn74BAEnKaAZZ5LjaXPKQyCEjypW5GEMzzQkyJPfotHrO7KPLa7VXRVIpd4eym3j1kd0rErbKo8fu9cqc40zcWRvlEdluxR40+99XfNlnPrdtOsGUIKtl2K8hS9rUbVkfCUSkL/NfOj/9LN3E6GRkQh21SkcI+87l2+Y+Xo6ErWkedumXI8hxju52Ut2YyzMlRsDdHEGSWHLw5f9fYYxj7yMDksBs+qoIuQiCAZiCcBWIL9gzU+yRViVABB0I0YH06JE+JzODMuHTD6ky944qJygRFCVSlABGB90MOQIldoseEaqZaAqgcG9A7iGESDmyIQXuFRNuKyMACqAAIGCinFBKIOTiA8Cg+UIGAIEgBAAekoAIyWQIPGiBkarpyQAg4kERQhCSuYIPyZGjtdZKJPH4CMJdkuPRBvVo1ppAkHyAZNKXCSSeaFLvDVmVRAQRYCqwZhkYT5NLPEbIZA6JIVI0lYsRITzdHOg9GsJyh4dYXr4peoS/CLg7OfpoWE2H5DVLHiPheCQAVlA4IA4BAADwBgCdASowACwAPu1iqk8ppSOiKrqtUTAdiWlUwAO3hMB11P6re7BjU3n/ZTPussYe3Fy6xF80TekwXmE9g6oAAP7uhwM9VAcbdBoll3QDugJ0c1XKQzE9I1JjenSVue8ftqnhjxqeqkPITX3DDSReImcX35V5qlOhS4AjCasWZTIHhrzxhiRO5zN0eBdPgd7VJA8IZK6QnR3Aeci+fLt9+I8MsWFn178jMfUtlQCGNj3u0bP+bBKvtArnW+ObCuntF8o6dKFpbGw3i7VKSyJwV3MiFuccWpMcEER4C8gvnO/CSM79vI0fvpnaXzqJsNw6ZDmNweHjVQFeGU70S7v/ySxXJ8x089Dn2iDBAgA="
  },
  "/images/Live-Event.png": {
    "webp": "/optimized/images/Live-Event.webp",
    "fallback": "/optimized/images/Live-Event.png",
    "webpSrcSet": "/optimized/images/Live-Event-119w.webp 119w",
    "fallbackSrcSet": "/optimized/images/Live-Event-119w.png 119w",
    "width": 119,
    "height": 25,
    "lqip": "data:image/webp;base64,UklGRqoBAABXRUJQVlA4WAoAAAAQAAAALwAACQAAQUxQSAkBAAANuQpE9D80chzZdm3FfzzMf4YeMpD3g1hbJ2Vp3ZSlRXq0B7BvHjEBefk74NoNfPHR9K1LAL4KSQDMlcbMN2wQfzCkco/tKFO0A8UIYWJkOxFCG0gck8wz0kyVibYF2wDpZAQ5PMmQCEkx0n312dQE5zLA2MtEBEmDOftOE0icCiolBJkp9GkALvfJKgCuvcOHzs4MCUpCBa/ds3oBQiru2gMKZdsICagikqkiwT6eO/4fXmT2jHKt9hZC+VhkmvNBVcshDIZrvWOey5OcqBJcOzob6kVusj4J24V0G2C339uByHUgFR5dIT0yOYJJ2CnYBlOq4++/ooH2gch2x1EoERTSZBKQSIhdAFZQOCB6AAAA0AMAnQEqMAAKAD7tbK5QqaYkIqqoATAdiWMAs66AF+AAMqwUVRbAAO8ovvR/5ehZIM5s8fudbGav9Cn2oqbY0Sb8TBHEyoZ2ZzuRHuQHIMX0hicCkbCJ4LQA+6P+DmFFBsC4iYtbCrvxMphyFKdPsGAVKPD4n9gAAAA="
  },
  "/images/Membership.png": {
    "webp": "/optimized/images/Membership.webp",
    "fallback": "/optimized/images/Membership.png",
    "webpSrcSet": "/optimized/images/Membership-147w.webp 147w",
    "fallbackSrcSet": "/optimized/images/Membership-147w.png 147w",
    "width": 147,
    "height": 25,
    "lqip": "data:image/webp;base64,UklGRkIBAABXRUJQVlA4WAoAAAAQAAAALwAABwAAQUxQSNEAAAANmQssRPQ/0shtbNu1G3iyCPZfHCMr79pYB0q1sZlyYyv9OAX8l0dMQDx89N0f8MPpxq0LtOpvlwTytfKLuQI0jWoaM9tvfko6/H0/cha0QmonKkCa4orWyc4wkpCOZc8gAEMmOiYTTGEqhSo6nWjVrBNDmn/vc6hEicD14kFatvRJrHBkEDvd45ypFRrWmMJ2yqGt0Js7ZWI+UEhX1YTMWtSZJAwLoLb71T2f+NAOZ/2XJiSxaq+3aBXTYz02kGRTa2IFoNoobQchpGVMhMdIAgBWUDggSgAAAPACAJ0BKjAACAA+7WyuUKmmJCKqqAEwHYljaasAJNCAAP6jCJn/+RzvSpVf/1q91/fUFuSTot4ce7tf6DOrkDirPCGNUa64PAAA"
  },
  "/images/Oracle-Circle.png": {
    "webp": "/optimized/images/Oracle-Circle.webp",
    "fallback": "/optimized/images/Oracle-Circle.jpg",
    "webpSrcSet": "/optimized/images/Oracle-Circle-331w.webp 331w, /optimized/images/Oracle-Circle-408w.webp 408w",
    "fallbackSrcSet": "/optimized/images/Oracle-Circle-331w.jpg 331w, /optimized/images/Oracle-Circle-408w.jpg 408w",
    "width": 408,
    "height": 410,
    "lqip": "data:image/webp;base64,UklGRgwBAABXRUJQVlA4IAABAADQCACdASowADAAPsVQnk2npSKiPH34APAYiUAVhnYAoqH+XWtSEXiM73llL7feaqMhbeaeL6w85W035elC+q1aI7YQisXg2Vbrq9rcCsaYAP7wVJLiNJS2BD02tGBudDxcztvXR/kLQpO6cVVnVfhJXQktqrU4ivT0iAK2OyBUPofWXaj+eQmb+rL6tulYAaRGAzyuHLrw3nW+Pm1EdoyC7Js1RgmjT/TtSddO6qnPJws+Hfdwmw/zyGmre/Y6bR/rK36uLcpyR3K0TPEZsZ0vQ4UMqBkwUcoKe4vnnEupM0QPSa4K9osYtHVnOQ694HuakOO8Jgaj8gDj/g5SAAAA"
  },
  "/images/about/art-of-manifesting.jpg": {
    "webp": "/optimized/images/about/art-of-manifesting.webp",
    "fallback": "/optimized/images/about/art-of-manifesting.jpg",
    "webpSrcSet": "/optimized/images/about/art-of-manifesting-240w.webp 240w",
    "fallbackSrcSet": "/optimized/images/about/art-of-manifesting-240w.jpg 240w",
    "width": 240,
    "height": 291,
    "lqip": "data:image/webp;base64,UklGRiYBAABXRUJQVlA4IBoBAADQCACdASowADoAPu1oqk+ppaOiLVM8kTAdiWgAnTLoSDfsWzglzWNqJlsptbxyj5LNyD+LlsRUU+8+WL6D72cZFeLRqYnGd4lnIpPgT0sAAPyb0U0fIH7Dle/lSqFYNmNNO/6/GPqo50ZiImEBV6vkLQKeidDVXkXjAaefj5oEaIva0dOHep+nuClrldp5CUbq9lWaPAEaVefTQ6yGlDnSy1MZtFb3PSRlzETs+Rf81XzCvGBZQmDNi5mMUxAK6eGVsXq9biLIt807hiccKPe6xsFSziztar59Canuyop/HmWwvvA5MPC/O3MY9plg7K+xzHvGfKH4HzPmxH91MNrvZpT4eD6HzHuQhRAbPJB/YnwAoJBLRVDAAAA="
  },
  "/images/about/astera-sofa.png": {
    "webp": "/optimized/images/about/astera-sofa.webp",
    "fallback": "/optimized/images/about/astera-sofa.png",
    "webpSrcSet": "/optimized/images/about/astera-sofa-331w.webp 331w, /optimized/images/about/astera-sofa-480w.webp 480w, /optimized/images/about/astera-sofa-579w.webp 579w",
    "fallbackSrcSet": "/optimized/images/about/astera-sofa-331w.png 331w, /optimized/images/about/astera-sofa-480w.png 480w, /optimized/images/about/astera-sofa-579w.png 579w",
    "width": 579,
    "height": 816,
    "lqip": "data:image/webp;base64,UklGRsgCAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSGABAAANmQ8QRPQ/BI1cR5Ic2aHWNj+AdOX//4b2lKk8Qmt1d298AjVo4Fmv0OdOo6jJfe0+oMePmIAJOBQrHnXYcXZMmuU7r7z03DN/Xzh4zdMspxkTG+QROTGeeuiuW66744En3jjjvIsuueayC/b3zzkB9Za/txYZxyW8lzMCQe81qufur8wZ6ItLa0QGvY9RPk/b3WaoaoylYLStJeHdVyODXmPptg0SALyWMcZwZm63Fu7SKiTlo/ykJLGivI+/VWLaTEpaAZB63waxruDwXmBOEl+VBMo9iA0KgtSdDAqMz1wSgcAOShIAkCTcnRESdwKQk90REewOJoUdVkByVya7wqbvGIBgLR4xe8y5CDtPhKo8J8wotMhkjYKFbUcbwFQNmU052mSyj25pe2oEtN7LgAXNTEGpxZtBREJ+oHY4I0otYSYHFrQUGN4bYoT2oIbAUKHpUGsA1Jrjm9NqjWwNVlA4IEIBAABwCwCdASowAEQAPuleqE2pJSQiLvkt+SAdCWUAyF1wIk2gZTuSXaNiAMg7EFLvruDiVhdCuRui/MwfaRcDnKcD9KbuSI8YZqFccuhm47feX8LWYV/fREAVq4Rn7htKIv1BoQHAAP700WLPtCuIbRfghwIADxqSK8NU+aQ6rs3LNt9cINCQEK8vtEMLLnMkgVPELrBZE7c3O6AwqT/mdDfp4669Bv2mQuO/i8s2zVIfN7uWYuyIIq4dLoCpivZY/VKgIASYg5jjxRt1DgpmkbGXrlfIIkv/tKrpVL01JTT1+dQcsacc1MVB9NMa6moYj4tUNaQ0UprHuiFz0iY+qwu4Q3TuFsyrVEGMpV1TVN8ZxRix/FS4jDGZzE7bUqWOPej7Yn7pQQ8t/OkTghxkBsHQTw0KA/f6ctrHdbmcVx56kQAA"
  },
  "/images/about/audio-chakras.png": {
    "webp": "/optimized/images/about/audio-chakras.webp",
    "fallback": "/optimized/images/about/audio-chakras.png",
    "webpSrcSet": "/optimized/images/about/audio-chakras-255w.webp 255w",
    "fallbackSrcSet": "/optimized/images/about/audio-chakras-255w.png 255w",
    "width": 255,
    "height": 255,
    "lqip": "data:image/webp;base64,UklGRpABAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSJUAAAANGbIBylRhFNH/qLvGjWLbboMk57D/jZqc+tcb7kOtH0+tHtdVDpVSayImYALmR4YOVpZ2TiCQz1ul177b2nPviJCYgFZP7TFLkZAZ2Kq0ZRhdSqYty7+CAak5/bkRQUg1gKaSAJiDhvOiBGBiaIDCwigFjqjc3m8IZRvdwIVOKoW83z96KMxlEDEGLTrkAaeEYKFcAABWUDgg1AAAABAIAJ0BKjAAMAA+4WCmTaimI6Ix3MwBEBwJagCsOY3ZGkeCriIcC6Om3KowCtcaoZk7i72ftWBdDdXstvhjqA9vqIK6wyylUPgA/q6cSB1gvtqQgVC3QroHute6P8Yf4NqQaIVtjh2QlNTFi577bcYgEiEv+v0Or62W9EnClCjv8R/VI6R5JZ4wdNeUQWkO2bO7AK7aucMPEX1v/rfXCnlODa0MZlQn955VLAWEvIZeubxppy7mK0bEIzNtvU3vrRsocRM6l0atH25WAzF4h45kngAA"
  },
  "/images/about/audio-energies.png": {
    "webp": "/optimized/images/about/audio-energies.webp",
    "fallback": "/optimized/images/about/audio-energies.png",
    "webpSrcSet": "/optimized/images/about/audio-energies-255w.webp 255w",
    "fallbackSrcSet": "/optimized/images/about/audio-energies-255w.png 255w",
    "width": 255,
    "height": 255,
    "lqip": "data:image/webp;base64,UklGRqQBAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSJUAAAANGbIBylRhFNH/qLvGjWLbboMk57D/jZqc+tcb7kOtH0+tHtdVDpVSayImYALmR4YOVpZ2TiCQz1ul177b2nPviJCYgFZP7TFLkZAZ2Kq0ZRhdSqYty7+CAak5/bkRQUg1gKaSAJiDhvOiBGBiaIDCwigFjqjc3m8IZRvdwIVOKoW83z96KMxlEDEGLTrkAaeEYKFcAABWUDgg6AAAADAJAJ0BKjAAMAA+4VygTailIyIxzAEQHAlmAKw5QVj+iJK17f+cAr2rBTJDeTX9noA4CS1/HOPZG1QprdfrxQ/NClFUIE9ZFCgMote9crTDYoAA/uvS084DscImTdv7VHAcF4J5jGrN1uNK9HhOKGH5RtmDK+ohavNR+zzWgfiQIxTi2reAPKLZK1iMYJjmsBVbwEK2E71I8RfnWC/ajo14pbl7ClIUT8DvB6PmI2QiDXnXPZiZGzZ7XlvnUgSeA2LFECU3EwGt+CgVlXm7U8gtewEHZyYVVRyvJLRrkdDgF1TGnptAAAA="
  },
  "/images/about/audio-more-messages.png": {
    "webp": "/optimized/images/about/audio-more-messages.webp",
    "fallback": "/optimized/images/about/audio-more-messages.png",
    "webpSrcSet": "/optimized/images/about/audio-more-messages-255w.webp 255w",
    "fallbackSrcSet": "/optimized/images/about/audio-more-messages-255w.png 255w",
    "width": 255,
    "height": 255,
    "lqip": "data:image/webp;base64,UklGRn4BAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSJUAAAANGbIBylRhFNH/qLvGjWLbboMk57D/jZqc+tcb7kOtH0+tHtdVDpVSayImYALmR4YOVpZ2TiCQz1ul177b2nPviJCYgFZP7TFLkZAZ2Kq0ZRhdSqYty7+CAak5/bkRQUg1gKaSAJiDhvOiBGBiaIDCwigFjqjc3m8IZRvdwIVOKoW83z96KMxlEDEGLTrkAaeEYKFcAABWUDggwgAAAPAHAJ0BKjAAMAA+5WCmTaklo6Ix1m35IByJZgDLW5ODtw1cw/ES9I4zUTRK8naKyKaq2UvIr0SxXoSOdMnqj+ZAFQjmXbznAAD9rsL+XmhfRmdTLyGT/mOJfN5roDMLxMPV5AuBokSd3aTTBk5ka61pDsol9D5C8LWpPp2rBevE30jKSGujPYct9m92qyMvzkfo/lGg7mM+I2C3ygKiL5XET9ZDVrOXe5p1qugPF5/UWKZc0ZqTL1uCBMF1F/is9AAA"
  },
  "/images/about/audio-uncharted.png": {
    "webp": "/optimized/images/about/audio-uncharted.webp",
    "fallback": "/optimized/images/about/audio-uncharted.png",
    "webpSrcSet": "/optimized/images/about/audio-uncharted-255w.webp 255w",
    "fallbackSrcSet": "/optimized/images/about/audio-uncharted-255w.png 255w",
    "width": 255,
    "height": 255,
    "lqip": "data:image/webp;base64,UklGRp4BAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSJUAAAANGbIBylRhFNH/qLvGjWLbboMk57D/jZqc+tcb7kOtH0+tHtdVDpVSayImYALmR4YOVpZ2TiCQz1ul177b2nPviJCYgFZP7TFLkZAZ2Kq0ZRhdSqYty7+CAak5/bkRQUg1gKaSAJiDhvOiBGBiaIDCwigFjqjc3m8IZRvdwIVOKoW83z96KMxlEDEGLTrkAaeEYKFcAABWUDgg4gAAAFAIAJ0BKjAAMAA+4VylTailI6I41tgBEBwJZACsM3C1fDFQByGkL7XExN6263aqLMLebTUWauKBIkfyhL8SRwLBY5QmOUpwxJGjhAD+Vr8uE+AbKJi+85Y1cm+/ui0IrIBMKBX71jW34hdMYBKC/hcqKTgMXfw5VW1v/fX6335F8dpll31bfWkPAPzA3XY08LXefC1wX06RipsisU8iSiZJ9aCYLSMKvBltgfYr9G3KBfB2KrtoLcC6Flx90/Viksq0AXzBLGaAmQ9MHdO6NU1B3CTaL8nZ8SzBnasXkWARgAA="
  },
  "/images/about/crystal-spirits.png": {
    "webp": "/optimized/images/about/crystal-spirits.webp",
    "fallback": "/optimized/images/about/crystal-spirits.png",
    "webpSrcSet": "/optimized/images/about/crystal-spirits-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/crystal-spirits-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRooCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSGQBAAANmWWI6H+QRrJi267jtLON//83c87xqfF1HK6Ls63NeaMOm62puKBRgzqMTMQETMBOgAvOu+iS4yuuG4/dcsN9L3GOItkSoKCMiBeChninjlff6plHHniKb1d9Qwk8RwXiUqBMtts6HpdNbDZj/dA969Lq2zeAQAFRCRUhLJf9eDNrYsUTe0fj2FgKIoKgiAAEjpbd10x4HHO4HIhJIeKgoAhI+v/u+RvvHlSX2KXCO4UipVckTwCqXS2sEIRC2xFNR6C0RKTwZR0pLUUKLcdh4bic9wORssDX4AiUltqPUKmhuFyi5bicpojDF3Vcaqv5uJyW4nI5DX38VS6XGmo+UhbraJiuLBS9pYQo4AF9orZr+nzsdeotJUQpIkpENcrfvh1vjyZ0mDKzR7IOlBPFxImJS8irjQ9/T6D07eG32aN7GxQ5AhMTRwKdzb5jPXWs9GX/NsudCIURHEQ5AqHjcbgNAFZQOCAAAQAA0AcAnQEqMAAwAD7VVqZNqCSjojjZLAEAGoliAMA587ugADyMwSp+6AhLFTfDlx7jnXplxDZ9aWAD7Cgou8UPEt/aIv2gUnQA/FpyjE4GDlyac/Uc+PgVveX0Nee/Dx3XMoqIyxqtAqKCdheAJwd631HAbK0hg0NBkyV1uSHYMK2JdRRouT98NIh3P8224hsPeNCqyGne6sUe0Ik/afRCYJwwECBu8y8/guJggWyUiGRfkfLZ7zKm3vHEVnL9CXNS0EOY2ZvUXWjKtxQb3ZVu99HSfKvFTQSkC/klKdQoylre99JDD7p4/9D6ZvDbeViGkKvrWffE5TAY1PDKrTAAAA=="
  },
  "/images/about/dream-weavers.png": {
    "webp": "/optimized/images/about/dream-weavers.webp",
    "fallback": "/optimized/images/about/dream-weavers.png",
    "webpSrcSet": "/optimized/images/about/dream-weavers-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/dream-weavers-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRrwCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSGMBAAANmWWI6H+QRq6ybc/bpLfzP9FA74ukkC91vIV7eXi16uX2Kn7w1H7wZCImYAIeBHjokScem+dX5s/eeO2tbwI9JUC+IzaJAiRh8fzUXuqT7Uf23l6UKgEMFSOhapfemxZl76W9rz54774yPTcRURBIRUHi/bb2Lp5ZxN1m2h1f1TyHKQaMxEhEIl6d7zYvXCzKvGF7bkMAQoAYCWAktT2vvthbxBS/qIlVIwtjA8RsrUy9BEhlpdUjYBjfdrDB7WpHsqurHQiwZXQzlImMbGs70m/QdrA/v4ljge1Ytgxty2/ddrAfNcSfZ1b4PduOZcvgJo41uiEO9V/UdihbhjVAqivLqjInWu0ys0SjSWa4XeLtunaXc9Z7LK5IGQPVEsjF3PXOktxXWYeZtdYgVmCqVroSQ19e9tUyt7peu5np2zKRhnbCTnUMyd3M8e2S3E5V222mjZJ1t0yVLroSiLHn7NYCAFZQOCAyAQAAUAkAnQEqMAAwAD7tZKtQKaUjoq40CzEwHYlsAMK0DsZ4AQgEKfvIW/e/qi2ajjYvNmM/m7zq/lwV84AHToePAxyBRp1zEw7l68OhZbUuW7vccAAA/uv/u+0zxg3nLTJgIECyB5ZmhWmnRtGOSnq5uvkTR629GBqDO/DM59jRxtHHCr0bR2KNj6UPNMnxfNzssRLvYAb47q/jKzy4lOwgjLhQj/dBWAlTGPiHTCz3iXQgchtydpq8Xqn8Vkt/8128iFTIM6jJekzGUwSro6xqhC34TDM1S/GmpLd4vrk/wt2SqAZhbFz+3HKvlq1HT7/sEgYEMkOwg2tB8QUwZY+1oWHnsvoAbaoGVv7NyNuL0Zbvs3OoWS8j7a4SfFbwGUBbN9tnxVUQZvOdLWePRZ4AAAAA"
  },
  "/images/about/goddess-power.png": {
    "webp": "/optimized/images/about/goddess-power.webp",
    "fallback": "/optimized/images/about/goddess-power.png",
    "webpSrcSet": "/optimized/images/about/goddess-power-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/goddess-power-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRk4CAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSGgBAAANuYzof2jkqrbt2o1z/P/vzDkHBXSc2nlRdFic077NVPXgcUGV4T5QZSImYAKuBLjquvmm+Za7Dt947IGnyAfhmjmJQKRIVKiEnQ8PD3nvlZde6zeMkXeq0ztKQDD08q2FGvNOGXeMzf/nVkttx6HVQZFIeqQTXf3t24uxExcX2azPGJUKBJAYJGJNpevVMm473ynbw6zWc2L4MgSIxABG3Pyd5nG4EzNOFsQdgMjOCZZxWkjVLgcdMTSensasXr1sCLCkddOUibRsadnST7iJbYFlY81btmVJ05Z8801rzVu2ZUnjJrbVvOWeTDwgq5d7+TG3bMqkp6n9RtPWd94AcU8TbBPt5W7mi/T0CDBXuezissrh5eiTC1+KEQzGGEkdjlpe2IV/q2ncc1/omz6BEWIwYCBQl6P+r3dxs17my5MxO/1djKH6jMEQE0iNi3627MJmWVHn52O7WS3dGVIJRAjEwCHLJABWUDggwAAAAHAHAJ0BKjAAMAA+7WCsTqmlJCIuOAsxMB2JQBh9Cb2rzwM5t/On2bBjn6AEdPEXXHrGaIMhIM9kgG6lImjHHpXURMPwAP7e38vyPmDMn4G238/5CSOhqEj0nQQMr5iDlRrp6mhhLHRCUIaH5CXP4z1AlI/X0hj9uG7nC7LgGBOOUzyEwUbSel/fmV70CxzTFLS3HBzcjrEizctYkmvEmeWelG9Dhnvs8NFvG/tD7MrBQa7NiKjnTLv/a0UFAzAAAA=="
  },
  "/images/about/good-tarot.png": {
    "webp": "/optimized/images/about/good-tarot.webp",
    "fallback": "/optimized/images/about/good-tarot.png",
    "webpSrcSet": "/optimized/images/about/good-tarot-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/good-tarot-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRpICAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSGwBAAANGTJp21DbvYvof+inoazatuu4ck7//6OGnJMkqGtjd+flgFtabLUcNtOtB+JAtQyq0HpETMAE3Ahw0y233XFx1wPjtScee+atvNfpyecxNiHvACRh88UYWd94aQ/3zZYV6zMjGFPNcXWOueWeh8a6f+qVcowLYkojREQwst/XOPzdlMP5PP73sy5mM2PASIxEBFLP7U8Xj4xs4HCR4z8aAhACxEgAY/T4wjr/DjZ3c1onu0Y2xgZiaq1qLraccQSM4etuiIv6DrQry1q8Xe2S7GpZsF0hLug73exie1YmsmRb2yVhIl+07cK+BW13sF3A7uFr7KKiyaII8kWnsjCbM4+7LdCwdLMkIexe1ZPWareZz1JYWrUyx9zh5OnPjwtrAKSiUAbKQhXnuP6xzeMfs54fWtaVcq0WWgMQOpxqnO+QfTzGOciJCsFZE9tZne5ujn/qMLYxZ/nvTy6GWZNqQtIAM7OTuP9/bz4DVlA4IAABAADQCACdASowADAAPu1mqU8ppaOiLjQMyTAdiWQAsR9oiZEUAZCBuct2zLXeoItRktsPO0pzK5U7AV+5UVr8N7DGxrfBjyflE3hVCqoc4eoAAP7um6u1kl2Zw0wYmHSDB/H9O6dEeShCkgaVZlIktDm3WL5C8BwZD312fg/C+NFHbYji+XV+CygF9KamWJDR/T+pEGJ+Up55c+IfJUllk9YesyEnB0IQffE1jb4IIsbKpa+URnPSYhfCgCAOQt7Ad0ce8EbveUL7bS1QAL0zOIoyPIaatugKXbiiATttX5VvRePqd0wcHtpwr8DaLAWZ2WXgPrklGhLqHIJYUk4cmAAA"
  },
  "/images/about/hidden-realms.png": {
    "webp": "/optimized/images/about/hidden-realms.webp",
    "fallback": "/optimized/images/about/hidden-realms.png",
    "webpSrcSet": "/optimized/images/about/hidden-realms-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/hidden-realms-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRroCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSHUBAAANmWWI6H+IRq4j2artmEn+//9kZvs+2A/iPjrpHe2b3qU205YcPek8iJ4iJmACrgS46rpxw7jty+lLDz3wzDshGdcAROIwIECKz+f0ptO88cJr67fGl1M62v1E0sc0lPKVTk1jxZc75u36qbW55XQQUSMQ7WJJ929SrLjrC9snTpxHUgGDxCDpw4BO/D3Nqs0p65OqGIAESyIxhVjWuuovfUWlTwTiJ0DksyG9IjBXdAUQDXsrdMQ4Js2qfRUgBCu0a9KLlkMvGg/HfMvGYsWWTDINGwr0ovFwrLVsrEXLtiyHTcWiaVO0HXoRG4KAHFyrl00dxpaNHUATWzKRxi0baz89jR3w9DS234ZouYPJOiUdd2I+SY8SYQzpfq4vC5t7Bn+dPqdEg0EioTZzpudWeLJ1c98FLH3pBiEGgwELc/rlS35dsuJyvcxfvs/D7XbCmOpFAEvKwOn/0+nXsmrZLpxuvnzJdLkIwxRFetILYsjsMgkAAFZQOCAeAQAAcAkAnQEqMAAwAD7pXKZNqSSjojVVXVEgHQlAFsj8obAlD0CaRM3oD79OuatYgfJbLwkTi1HfDmpYneDVUU7GVdXBwWPgCWAipvqGTUUy2ttabYQAADShB1uFti0kA3m1kgewBvaTLEYWHRzohzyj5TKvh5zjnSCbDXsN5DNfEDoK8nYZtNtvhbfbYkHujWaqSadWwCHmx/3dJ0IORH9rYGtxsnmhRhWNujdXlD5ZNYTOmX9iwZ5uJ+eWTsKSHEMRZCjHZfvviVqKPqiiNGk5En6ivO3zABKUKILuqn9fxHKpVKuMImYe+JAw0c/wD3wgqqu4T0jzDX3HTSbelLKkWKWfz3JT8KsgbT2Sctt2aC8qtaoTLSoZRw5FSzXYAA=="
  },
  "/images/about/logos-1.jpg": {
    "webp": "/optimized/images/about/logos-1.webp",
    "fallback": "/optimized/images/about/logos-1.jpg",
    "webpSrcSet": "/optimized/images/about/logos-1-331w.webp 331w, /optimized/images/about/logos-1-480w.webp 480w, /optimized/images/about/logos-1-662w.webp 662w, /optimized/images/about/logos-1-664w.webp 664w",
    "fallbackSrcSet": "/optimized/images/about/logos-1-331w.jpg 331w, /optimized/images/about/logos-1-480w.jpg 480w, /optimized/images/about/logos-1-662w.jpg 662w, /optimized/images/about/logos-1-664w.jpg 664w",
    "width": 664,
    "height": 122,
    "lqip": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAACwAwCdASowAAkAPu1krE4ppaSiKqwBMB2JaQAAN43KjZ7Mys1dMAD+5/mrwP5ZWuE9eXHPLDy+tGlYks7oNa/zrxu5RiGy+AAAAA=="
  },
  "/images/about/logos-2.jpg": {
    "webp": "/optimized/images/about/logos-2.webp",
    "fallback": "/optimized/images/about/logos-2.jpg",
    "webpSrcSet": "/optimized/images/about/logos-2-331w.webp 331w, /optimized/images/about/logos-2-480w.webp 480w, /optimized/images/about/logos-2-662w.webp 662w, /optimized/images/about/logos-2-664w.webp 664w",
    "fallbackSrcSet": "/optimized/images/about/logos-2-331w.jpg 331w, /optimized/images/about/logos-2-480w.jpg 480w, /optimized/images/about/logos-2-662w.jpg 662w, /optimized/images/about/logos-2-664w.jpg 664w",
    "width": 664,
    "height": 122,
    "lqip": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACQAwCdASowAAkALrV2u12jqampiYC0S0gAB3iTZNJhI7hPSEoAAP70Ro4VQpnvn80XtUw/tHCyc8G/oESBVZp6ze/0veAAAAA="
  },
  "/images/about/messages-spirit.png": {
    "webp": "/optimized/images/about/messages-spirit.webp",
    "fallback": "/optimized/images/about/messages-spirit.png",
    "webpSrcSet": "/optimized/images/about/messages-spirit-240w.webp 240w",
    "fallbackSrcSet": "/optimized/images/about/messages-spirit-240w.png 240w",
    "width": 240,
    "height": 291,
    "lqip": "data:image/webp;base64,UklGRgYDAABXRUJQVlA4WAoAAAAQAAAALwAAOQAAQUxQSJwBAAANmRWI6H+Qho5r26rtqJj631Ym06dTlM4rQ1RTx+nbmk6fbmpKSxETMAGf5Nmf+do3vvSzH/zkN5/63fzBMJAQcZsZmdz4uTff4lffu5h7Moynk5Akj+OD5w36nS94ufzCJIGEbbMxA9z7vwtvbuD8ePLh6p4wzNyTe/ZTs4Xrjy48v0ndsM8kwDDJDMzww+V6m8QwSAPMNNIwg2t4EyQGGLc3bsy8TWIs3MTiCbbSmulaTa1FulYTSzfbtUhci2av1cTSTc1S0LTYv/s0Wwma+AeZ2FKQ2EIhxsLGnzBXSqSVhFg5CR+s6SZDerA/YbpWupdqapb6G0xbC5obbI1m+6yEHixBISFoeiiaCA0ktw9GKpkG2cMBGkOGm/vPZ5idnZljx9636FmSbJv91MzHzUeaZhqOY2dQbXd7tz9s9z63zZ54/vw512NAsn0ce2dQfOigIzkUstn68dXz/r8e7Ir9FHAyQ8JGYRBmm/CV16/7/+3s2sfBFho5Hc/xHGecaZo9Aczzs+s+8Ij26cwwgh+d05nxFJs9QaIBVlA4IEQBAAAQCwCdASowADoAPuViqk2pJiQiMrkrMSAciWoAzQlBUl5vUULmhAB8zEOFNbdY9cJdi0j6V9NMcsqYYwErJ6SRtxvj5mvPg82aQo8oAwRtATe0vVmCOgKljx6uVWpRRWPcAP7wQn//NmH1CW/tsyiP/BBuHEkvvON4UX1ZQqxUOlTyEeBY3oyg/wOCiG+9Rq7ZTkkDg+ibUX+rJ5Q1e3mDCkAGsGH9Dw5n76o5y4Tz3h1Qi1T1BEdfWqbCs5U85gyY0jgDEfgHo+Wz3eFODEI7bpXIn+vx86lcDlkbawVpVmxzUFabu/mi7Q+h2Xm9Aprz/PK+lu5vZg0NBokUtqnH+TWYU52/BI+U7wiOSxxHLEW4dYdvul9vjrXij0Z4Ld4VMJVuvpOwBu7Fx4Ek9wJGvvfHHeZnbX5gItCyPTR7rSXAAAA="
  },
  "/images/about/mystical-shaman.png": {
    "webp": "/optimized/images/about/mystical-shaman.webp",
    "fallback": "/optimized/images/about/mystical-shaman.png",
    "webpSrcSet": "/optimized/images/about/mystical-shaman-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/mystical-shaman-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRoACAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSFkBAAANmWWI6H+QRo5r220kdY+f2f86vfeJ2nFseAmm9fCV1seraBwBRQWwTFSImIAJOAtwy239rjvueaS99cxjrwGcU6akL5yWJfIzhaUUk9rNzZ+cTu/Q7muAqQSBFIoMZPmj4d52Fzyw9PHKG+/VvltSWCYUMoACY8VqXdsyX/BQ69vt72yJuhHOQJaFASzH6lR3y2Yq+1zHdoe4UGRIlpGFAlita9u1KTquiMvLTApZKCLsnS64cRkspynaaUp2mh96Z2SkCwKc5ptuyUU5jVUS4HRh31dnpIv6FltyWeB0UZZMyU5bRYHThf3wO10YllxW6RZyUb84LeTLVdQlx6WsCQVYhuxyvSA+GK5LEq5TxgQWhIg00maXdXuBxgAWz0MjLGwLpJATZyTkssnT7wtAo653R9o/h4K05G7JCXJaynnxS/8u2omxGn1DjyCN5JQsiLTIELP+DQMAVlA4IAABAADwCACdASowADAAPu1mq0+ppSOiKrVdUTAdiWMAygBHomyracuhO/UHSKq9ssIV4bm/FEjbR3k4/teIfEh+/oeuvQb0GMSrr73MyY7sRiwUAAD+8eCrE75W34zZrNkO+gG2fP8SZciejb0tjVHxdZ5hhhCxaQ8f4P/0ITPe1h7nVpWzdOQCF9IlVWR9HW34m0gPPNUzxn7nyJgmyPukwZpxV08MbqQkdKxYsMk07OpqB1a5Rl28ILSPMIwWIRqS5FicLqCDCasl7faFz2fQQNOPbh5lT084dFwRPakUqG6uFGCxxOZ6Lvr9lNNBGjnV3LM+lTgvFUo+DTDWQEM7yAAA"
  },
  "/images/about/right-place.jpg": {
    "webp": "/optimized/images/about/right-place.webp",
    "fallback": "/optimized/images/about/right-place.jpg",
    "webpSrcSet": "/optimized/images/about/right-place-240w.webp 240w",
    "fallbackSrcSet": "/optimized/images/about/right-place-240w.jpg 240w",
    "width": 240,
    "height": 291,
    "lqip": "data:image/webp;base64,UklGRhgBAABXRUJQVlA4IAwBAAAwCQCdASowADoAPt1cpU2opSOiOrTYARAbiUAWI+5BhRwgNU9F/5H+m696wRQ1jz23YQVWat9lhox+V8lO5CHN47TZUKPX1E9Hovr1SLbC4NiAAP7n1RFOZmveQ3O6vai/gQ1tIPgDUDbra/0XadK2mjDxMk5Wi5kWXh7hLRprJ6NoHJ5ZZBsvIzFOUwQyRR35cGDssPFLZjxR/2zfC2K03yHx16qFDGwmeZ9g+prBW3W/XOxKkRIhaRhrc4iQJIKyQChd69vrYWCRPcpooOeNnLdSHDMA4iE23qSsGp3QPCRvxWuIYn8SRBb/r821fN/uCnkwfjcg2B7oamMgMyfmTXGhsrk00xkGgAAA"
  },
  "/images/about/spirit-animal.png": {
    "webp": "/optimized/images/about/spirit-animal.webp",
    "fallback": "/optimized/images/about/spirit-animal.png",
    "webpSrcSet": "/optimized/images/about/spirit-animal-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/spirit-animal-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRlYCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSEYBAAANmWWI6H+wRq5i264jjXf//5/eeyM1zBs/0bq8tBdHqQ67owbxoCOBXjpETMAEXAtw3U23LOttD8xvPfbQCx8hunhDAIw0EEIrm+d59YM3XtrXfMcqSVKUEapDwBze092yyd098zhe7gfzXSvBsgLGkFiS7F8bu4vdJq6uev/cZXatjaRHE2MwloEcX6n16mKT88rh2Br5Wro0BiPEwP93DvM8b2KBUy1gNgCGjYJgGCfs3vKtDVRjyaSjmVS6elKRqUczrT+g0Uzrx2/itH780UzrX8OImZQxTNtoJpUmTDnNxOVHHsGcbYS5reQMcUsZKmZdzGlLDicOu52Vka/KMCQSUkKnd23tt3isSu5bllADKiVdWkroNLA052zNnlOdXJclI7GrgWVoRIcx6+DAdk8uh/05F90ZjDUs1XaEdLqsHhzjV1ZQOCDqAAAAMAgAnQEqMAAwAD7NUqBNp6SjIjx5+ADwGYlMrco8dbdiQ/90AGxRLiVAW2XHejwDA5eGetRw6wOf/RI/UNgzkaSSPkkwYfG41AAA/R49xo9z0WN/Tv9aG9f8W7GaAzVhmGb6HXJGDoMzGJPeEnHMW2cZgTM2Pm91tciXIxZc9+VnIVt+RppUj6E0hsYDp89CzSoEFUJ8lnaZL3ByWZ5y0xgO5FPKdt7Z8EDEwjNrzhMZAyMr03N96HEKgvQ1H7B9+ieeujFCEhEaVluQOxAE5VIn/apf/wtE+WE/y2eiKBz5c70qwGvCAAAA"
  },
  "/images/about/the-map.jpg": {
    "webp": "/optimized/images/about/the-map.webp",
    "fallback": "/optimized/images/about/the-map.jpg",
    "webpSrcSet": "/optimized/images/about/the-map-240w.webp 240w",
    "fallbackSrcSet": "/optimized/images/about/the-map-240w.jpg 240w",
    "width": 240,
    "height": 291,
    "lqip": "data:image/webp;base64,UklGRgYBAABXRUJQVlA4IPoAAACQCQCdASowADoAPtleqE2oJaQiN/caqQAbCUAVUfQ4RaZqtsfv/1bSGMKEV7oZ8yfdyWoDgvmo7UgCkQCas1Jw0RVdF7nJNxEEbJE8ocZsNsj7hzgAAM4/NKD3jFN/PjwX6LWDEwcuYlkmMjfxdKSa/JGnt1DVkUm1OKV55vcWxvBArpeVeFZb6eY/b2q8DCnWMfvFOHZiT9nBnYxdZWEhScYcO1KoIie4oF6AHaffxlm4m4SvQsVTOPLYG3HPjtZyVXW3ASSTViHTiVZj6vGdwQrPPqEhiNgxvD/jR9Sf9nrEePYw2Ska5N77T3JzfGizDQToO+ohmJAA"
  },
  "/images/about/wisdom-oracle.png": {
    "webp": "/optimized/images/about/wisdom-oracle.webp",
    "fallback": "/optimized/images/about/wisdom-oracle.png",
    "webpSrcSet": "/optimized/images/about/wisdom-oracle-275w.webp 275w",
    "fallbackSrcSet": "/optimized/images/about/wisdom-oracle-275w.png 275w",
    "width": 275,
    "height": 275,
    "lqip": "data:image/webp;base64,UklGRqQCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSFsBAAANmWWI6H+wRq5q7Y0krffv/5ze+92qhtG69IpK5+OvtH++jgaEoKMBKR0iJmACbgW47a5+T3/oND956bl3vhHc0ZUGkEUCGKc7q/dtG1980D76qp8mARGEsDBgZGiOLedSPnDaPnvvrWOwbx0RCiPLWCEbUdsN85FtSeczx6srb11K4ayJkWVZgQxxfVn3876yTy6vM2UBiAzJyLLAsuybFnPblujyQCD/AsgsCgQyjGpNrVywDFiUbiGX5DSlW3JZ/5xOF/YbOiNDJZVuKdIl/Y87XZaFXFTxFiAf4PQF/XWdLuxPbCEXJTBlO8uykrKFC/vrKlSYkz+qhXxYdVcn8CHWLwrZEHimHF5yG1H3mY0KKGRDWBCuRiHl3okjK+EhPxOnoRGEa6QhbSGj6JBKjl4R4UF9wntzWAj36Djdxwwp0FTUYO043droOzNCINK9dpxM9R4oNFrVLwBWUDggIgEAABAJAJ0BKjAAMAA+2VyiTagloyI42SgBABsJbAC1G/JKoGzw7KAACUz/z/qximBitzRBNROfYZDYXCnSUmue8FGLN+Um2wyf+8V1I2/Kc5pvAAD8WxyjNUtJyOppZ5bmwpCPvL7zLMDym+tWUfVRqXy9ebhu5mrdkrwOJUw/NUW01Yf7dEvjAzx0U1Rl52GYQD846UMR3iU1KE22oLAPnfnkfEKyVZ1b5N9+MnnjPUnWky3M/P5sLh1Qvq+ykzR3XkbPvYqmY9vs/dvLUwyudl4ZWRVe9lRdxDZ/O2We2sjAf2/FsPRcWYH3/+hmUbRHvamidfD9lUWwISwgzzRYseF6QY4Ba0GSJ8hlJ/R8MRJRzVNtzBcsfRCfEm3P3hyGmAAA"
  },
  "/images/art-of-manifesting.jpg": {
    "webp": "/optimized/images/art-of-manifesting.webp",
    "fallback": "/optimized/images/art-of-manifesting.jpg",
    "webpSrcSet": "/optimized/images/art-of-manifesting-331w.webp 331w, /optimized/images/art-of-manifesting-480w.webp 480w, /optimized/images/art-of-manifesting-662w.webp 662w, /optimized/images/art-of-manifesting-702w.webp 702w",
    "fallbackSrcSet": "/optimized/images/art-of-manifesting-331w.jpg 331w, /optimized/images/art-of-manifesting-480w.jpg 480w, /optimized/images/art-of-manifesting-662w.jpg 662w, /optimized/images/art-of-manifesting-702w.jpg 702w",
    "width": 702,
    "height": 702,
    "lqip": "data:image/webp;base64,UklGRvwAAABXRUJQVlA4IPAAAADQBwCdASowADAAPu1oqVAppaOirjQLMTAdiWgArDlBU16A8fWNwUW0eoS12LWH2qOJy/gCG4dcJCu/br+qrEu0l7OfRE+AAACHH56J1Pjs/wkHwKO/qXIIdq/AU+P2Zod1qufoCpqlpfTzZeeBHuhNOUrlw5I/dWRyteoS7CGWQ9PpsrTdrVW2z8gNIjb7axi2rAco1x6GDOSFYxKQKTnVYSmGtpuorRu29yH5MTlRpUWUitQYke5kZJkwCunHj1c4ll3KuSTQDCpQJDgGKVlsV7zTnr603MHyXdPjyKelMubyBO+Ld9zdL7BHrl4AAAA="
  },
  "/images/astera-VV.webp": {
    "webp": "/optimized/images/astera-VV.webp",
    "fallback": "/optimized/images/astera-VV.webp",
    "webpSrcSet": "/optimized/images/astera-VV-331w.webp 331w, /optimized/images/astera-VV-480w.webp 480w",
    "fallbackSrcSet": "/optimized/images/astera-VV-331w.webp 331w, /optimized/images/astera-VV-480w.webp 480w",
    "width": 480,
    "height": 676,
    "lqip": "data:image/webp;base64,UklGRgADAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFYBAAANmQ8QRPQ/BI1cB5QUyUEzRRwx8///BTt0ajlmZujc0it1Ok81kaUu1aatSk/qMnsVMQETsBKfuC622mLDNhF45omnptamadkQscg6R+ALrom0lx574J67rrvl330PvbbVPkecdtk1Fxx31H47xCsviH7WKsYGgzz3GhgIOnT03jHvBNaADnH/DAtSRu/Dfu2ySANU+vRME0PWmuEu+kkkDNpbz0UQH1SV1qbWwahzNSjcPwE0lyaZhk93bcsxhBFzUB0fdQDqKkl8QYXqUIbRAPBD7oQEiS/tKmDAyfdcHXSS+IoOBZwOGuGisFB8ZYdTFBaEKiLEvxZAuAjMoiMyFQWQYwhqqNUcXgBoGF2tImdxlGGjDdSYs6NMBkaTmlW1EESMPmrkhFItdUjCpRgkgNRNL8cszPU7ymWmDd8sCFm59F6UeXMtKYglijbXURbgUprim/dWUDgghAEAAHAMAJ0BKjAARAA+7WCqTamlJCIu9J35MB2JQBdme9fsY1gNuT1D8tb4kPXWE5/EvYZb5acxmldpBv9KP9Ki5RzLhuhOnFh5ZK7MwT96UCK6ismqDREbnkD76AwXqiLPYjfzenWd2igrz1vWAAD56Nyr4PcgkXjMQZ5uUIPIw64sDvUB8gTD+78fl42JQhHclaqcwo0WMAMlwuXohPEKyjHFjt83NNtAUVVxaZkR6IbhYDAbkMdD1RmtTPMj3rcuJhK5G79PsD6aHPNDmKz8XwdXHCUoGnIb/l3kZzds7RyjJncsbtnP9IoY/HwrOWku3/QTC4jawa+NSuhStmsQRQJXJQ10uxLqLaeDbvVXfYH87oID9llHgtLLonLNvzlJsU7Y/Wec00qbzq55mbvfuG7tLMt/uZPWnc+3J9MrbNrHYVZdidtOndc0i8bHXyz3TAxmJn6ZoTmEw18PuZqrVKD+rM4+oJcLALDgcqYYq1JFp1lJz2fhcXc97meYOj11sotczAA="
  },
  "/images/astera-about-home.png": {
    "webp": "/optimized/images/astera-about-home.webp",
    "fallback": "/optimized/images/astera-about-home.png",
    "webpSrcSet": "/optimized/images/astera-about-home-579w.webp 579w",
    "fallbackSrcSet": "/optimized/images/astera-about-home-579w.png 579w",
    "width": 579,
    "height": 816,
    "lqip": "data:image/webp;base64,UklGRgYDAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFsBAAANmQ8QRPQ/BI2c17ZVa/lwp3JqWv3/v8Lp3Hp399OTrJPT3pV927OzcLjZFXp2QkUiJmACVuLlq3CNddbKli0eueeW2+6466bf3aJly2xB4vW5WsZj/ZqrzjjhqNMu+qENdtjvgCMO+rLPHtutB3vAHnstcrV0ajxkDHcK1vuw2Ggzz3TVYfZa6dR9fRnKTf6t40Add019sHm0OV1WpVchHV6XZbE2O/G81aX3PpkiW2suGfQKoKuOoTlIvKKs9t9jGFu2oBleKoCmOpoTrytUmFVDhgMAXwADYBbEG5YqRJJwAJBJBJzEm5cMhEQ6oSrQhbcrCDCBQVZTBt7W81Qd9GCVp1sJLhvGaObZFhRIupZhnsr3shKAoPWFma11lcFAX+ocswylsC4jIycVAqaGzcBAMQEgNFkx8HDKfqNcRnIUhQz+x1IQIzDJCoK7Oop2lEaYyoJU2rvYAQBWUDgghAEAABAMAJ0BKjAARAA+7V6qTamkpCIxFA2xMB2JQBbQgmAoZPqKQDYo6R3a+xwR3JN+Xz1NYYc4AZbY5rwvjaqp+34WeOLa5IjYzdv/oouPP5H3lXOZeWResUukOObOZb7bK/lX+lRhAPRmmADu4IR9WLvwTlChKG74wzqk10NG6NMiXCjFw4Ys/VORQeqjY75WuRvonw597b3eC6q+VDzq3sUJQQOC6O9kl2PeigE8XtXraKe6xUiiesRKiuHj51ANxh8nVy05oXiROARYcwCFVxp4sTLq1OmcE+GKYc1Ap02X32A4jfDUPxVSAypNCkJmxuW+BuWF7VaCg9chhPdvkBdyRnm02eXT9zxgThM1EP0R6cGmu+loEwD/T8Qy0gPwx3zusjwM5n8mzJ6xxAkswel6IAKZf5Tr26/ZkM9JFN2WIbZUMlGs4ZpPsQtSSEYEpDx2ZRygtZ+Er5QxpqY6ANuepHmse85LOoVXEdOoa7yFeEl7X2/80aJOkBEIkk2wOlmAAAA="
  },
  "/images/astera-fm.jpg": {
    "webp": "/optimized/images/astera-fm.webp",
    "fallback": "/optimized/images/astera-fm.jpg",
    "webpSrcSet": "/optimized/images/astera-fm-331w.webp 331w, /optimized/images/astera-fm-480w.webp 480w, /optimized/images/astera-fm-565w.webp 565w",
    "fallbackSrcSet": "/optimized/images/astera-fm-331w.jpg 331w, /optimized/images/astera-fm-480w.jpg 480w, /optimized/images/astera-fm-565w.jpg 565w",
    "width": 565,
    "height": 329,
    "lqip": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAABQBQCdASowABwAPuVYp02pJKgiNVgMASAciWMAygBsA4pqhSvEQ33kXU7q3kuSzkVdggAA/vaHxWOEyFAv/eC2/AwUD85x+r6XaQaTAYrVkhQsGWvT1MFxrzWAldDN+ypmj0IHF3h0OnAA"
  },
  "/images/astera-hero-image-mobile.jpg": {
    "webp": "/optimized/images/astera-hero-image-mobile.webp",
    "fallback": "/optimized/images/astera-hero-image-mobile.jpg",
    "webpSrcSet": "/optimized/images/astera-hero-image-mobile-331w.webp 331w, /optimized/images/astera-hero-image-mobile-480w.webp 480w, /optimized/images/astera-hero-image-mobile-662w.webp 662w, /optimized/images/astera-hero-image-mobile-828w.webp 828w, /optimized/images/astera-hero-image-mobile-900w.webp 900w",
    "fallbackSrcSet": "/optimized/images/astera-hero-image-mobile-331w.jpg 331w, /optimized/images/astera-hero-image-mobile-480w.jpg 480w, /optimized/images/astera-hero-image-mobile-662w.jpg 662w, /optimized/images/astera-hero-image-mobile-828w.jpg 828w, /optimized/images/astera-hero-image-mobile-900w.jpg 900w",
    "width": 900,
    "height": 1100,
    "lqip": "data:image/webp;base64,UklGRioBAABXRUJQVlA4IB4BAACwCgCdASowADsAPt1epU2opaOiMrbeYRAbiUAYVDUxKkKsG2WFPYhDQQcrqhrDMmGQhPIbn1zO25ogD+HdxgY9CtljYHdk0AQ7IJKHEGzo754ttTy8AvryOupyjOyAAP75cgMUB6o0vJ1uE2iaiTRYM9x9LYerGZcaQnBB7rTKUWD7sqDe5BfdogIexrDcWGn9Hj5lw8ntsP8GAMxKx2fHgA7JX5k6rgeozmsUb4Mfh9MgMs8Ig2/TAVp3tUiWSLWIcFbBVYUz4dSzHsborH4yIlY5gNnXgTmEDAwDRb6FXVMH6ybMkI4OZPG7vrAPCB1ZEoThAYuLdk7XXScUOVcEuVaI5nzMh8O9dVW6P5PEgwZmwOZdegJ/b+kvLTAA"
  },
  "/images/astera-hero-image.jpg": {
    "webp": "/optimized/images/astera-hero-image.webp",
    "fallback": "/optimized/images/astera-hero-image.jpg",
    "webpSrcSet": "/optimized/images/astera-hero-image-331w.webp 331w, /optimized/images/astera-hero-image-480w.webp 480w, /optimized/images/astera-hero-image-662w.webp 662w, /optimized/images/astera-hero-image-828w.webp 828w, /optimized/images/astera-hero-image-1200w.webp 1200w, /optimized/images/astera-hero-image-1600w.webp 1600w, /optimized/images/astera-hero-image-1788w.webp 1788w",
    "fallbackSrcSet": "/optimized/images/astera-hero-image-331w.jpg 331w, /optimized/images/astera-hero-image-480w.jpg 480w, /optimized/images/astera-hero-image-662w.jpg 662w, /optimized/images/astera-hero-image-828w.jpg 828w, /optimized/images/astera-hero-image-1200w.jpg 1200w, /optimized/images/astera-hero-image-1600w.jpg 1600w, /optimized/images/astera-hero-image-1788w.jpg 1788w",
    "width": 1788,
    "height": 880,
    "lqip": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAADQBgCdASowABgAPu1qqE8ppiOiKq35MB2JYwC/a4VH7q/UQKNlSjJrdjY11Tt69X6sbSXRKw6a9PXro71tlwAA/vfvmtiObwlIBGkhNfVnpvmf3bVtcFOSyWYFW7ZuI6GKW6F3rabCpJKdB8MpNFbc9R45VSbyu2JxQ4ce3hDX/bJxRGc2DLK2ORhqg+4cOqJRpAunCbzQS0Q0AAA="
  },
  "/images/astera-home-bottom.jpg": {
    "webp": "/optimized/images/astera-home-bottom.webp",
    "fallback": "/optimized/images/astera-home-bottom.jpg",
    "webpSrcSet": "/optimized/images/astera-home-bottom-331w.webp 331w, /optimized/images/astera-home-bottom-480w.webp 480w, /optimized/images/astera-home-bottom-579w.webp 579w",
    "fallbackSrcSet": "/optimized/images/astera-home-bottom-331w.jpg 331w, /optimized/images/astera-home-bottom-480w.jpg 480w, /optimized/images/astera-home-bottom-579w.jpg 579w",
    "width": 579,
    "height": 511,
    "lqip": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAACQBwCdASowACoAPtVcok2oJaMiPHQIAQAaiWUAxGBM2fj6BOvgsV9zXRxQTRTA8Z6a0ruSB5OK4hjOgkizxoBy0YT98WAA/smTcW4bMKGuE2LlEqXT3Lv8ZGFNbMXwxjt0DUtrhvLRp34qrdQ7ZWipf2k5w8g9s2MQADp7LmM75sJfVPR9qjbH18EBjYWNOcXgOCGf6A5ccw97X6yZKGDDbSzuaT4i0E0LwiIVREFowWDntdDiDvMLTuLsAA=="
  },
  "/images/astera-home-top.png": {
    "webp": "/optimized/images/astera-home-top.webp",
    "fallback": "/optimized/images/astera-home-top.png",
    "webpSrcSet": "/optimized/images/astera-home-top-331w.webp 331w, /optimized/images/astera-home-top-480w.webp 480w, /optimized/images/astera-home-top-579w.webp 579w",
    "fallbackSrcSet": "/optimized/images/astera-home-top-331w.png 331w, /optimized/images/astera-home-top-480w.png 480w, /optimized/images/astera-home-top-579w.png 579w",
    "width": 579,
    "height": 305,
    "lqip": "data:image/webp;base64,UklGRhoCAABXRUJQVlA4WAoAAAAQAAAALwAAGAAAQUxQSFABAAANGQJJW7ztj+h/7Bo5jmy7tuLwJvQmdBnMfxwQQUzsvfdwRrC2TnqX9g25W+unR1si3Sd9ipiACdiLn+87dMxxJ8xTku+99cb4/p1tN5gnrb3PJH6bzOT2wmMP3ffAI3zilU/6ORfccMc9d/276arz5mf+kfRbmbkP9gFAQoTcqobP/2DmAa/y3yAjaGMMn6edsc4g3GvsloJ43NEMuFy/QgRl9U71NUh8Lzcby7KJmX2NcId+AYS0VZ9B/KrgtVgVYvYAJf5IAFiGJH5fktwckRMifigIkpLEn5aKIEGQANzFAIi/KEiEAxGAGxiBvy3CZWIGzZFZf+17lisyTDnDWwhYGXN69l5qgcExnKt6H0IjPjbmXOdAm0yOzdY4cm8EGbb5TC5oNVJunapmkKRCO28nMih/Te1wRmzaoeGc3DAaYoYWeEOIwICaggbRMiFWUDggpAAAANAFAJ0BKjAAGQA+5WCnTaklo6IwCqkgHIlnANCRiubeZBymoFgewVvR3LIOYa78dnZmpQJoiHAA/uqIE75f76dvniX9D4uIEBH6XaXBXd/6yLvNx3hj4LlIYNpsAydfJ8kYvWoMKbp+UeR4PUVwvBQYthdm3gDiYl/9zWL2ykA2R/3uJdobPm+VXzjt8Mzc1XPU+lMIILl57OBnMaeVhAkviAAA"
  },
  "/images/astera-logo.png": {
    "webp": "/optimized/images/astera-logo.webp",
    "fallback": "/optimized/images/astera-logo.png",
    "webpSrcSet": "/optimized/images/astera-logo-184w.webp 184w",
    "fallbackSrcSet": "/optimized/images/astera-logo-184w.png 184w",
    "width": 184,
    "height": 184,
    "lqip": "data:image/webp;base64,UklGRv4DAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSK4DAAANGQJJW7ztj+h/7J/GkmLbriVJmaXV/IeqtfAI9xnsw4Nq/c1+UK232b8V8DjgLYdzIFpOxARMwA/xmj/CPzAIGOLt+VP9Mz9hAuDf/F39VeltaNuoTED0L3SjVMrr0c38hSaRwHjPX/q5hpS8Dk2oZqRhQ1Vxn7+2TUivQpCaKcmgG7rnltpHL5O8AhhNgd1Q3M1b82f3BXTTwdcTKSU8zmM5IddVf/JHf1AC12C+JkAi9vErv9H18XuX3Lu7ueeuAAb4RQHCgI3083R9XiPQ6OO51mOIBORLSUyQqM9vc/zOs1PlNjU6Ds81BgSQXwB3wtT98VHH/97X4LbqvsSZcB1U6P+m0CblKPfHR53fv9tuo+q+Z4Q9lrkR8wV3I70su7596jg7IBiwLmEPcpER/R+Su0tZMPu+97cPNBkJZlPurVE3p6oNoNLLemSb7PcT1zUCo6nGYfugWGqqigZS7c1coW2uUVXyMgrR7W46d61ZN5qQdqlSAru3Id3FtqYBEIRRVT63qmgMvUyBk24iMIqGBsSLJcSno0Gj7E5ASmpIYNBNzdFMACQKwDU0WVSboDdXBfwP+TypeS6hEFZi34krasiGgMY9gg1ec5ynU50mqokKF4/ISTVgqsJ2KUGDD/WS4VlkjyvBbi6hIQChkQK4BEPzU27V0KK3XJF7dcPtBABC0uZ23VOEIlQVkeEBlm1zsscyAILApI2kJKBSkyByiSvDRmmPAwEBCAhUYOh274G5CoeLqmo1OnXnuZiYASfA3Be6u5f2eegS2sVWtYBAtd8zD5FBX6ExH9ljOwD34H2rFyAH07CRPq7HFTvoGT4P39POTES0qZLBJmmgEXXf18UDwepR5289UZTmJgCRgELQCMiUcHIeOVpA9+PK+//3qlQBTmCCoIANAlXFzzxunxSAFLc5d8jjhG5sM7QLyCRATXFPTC3+q9LNumu3M5d8rNRMJQngpW6sMcUXhN1M7Ny3+tgqAiUxpnk0QqbUeFGx2QHmU+5NkVER5NKJTUMDvpTEbaQK251LdAQQ3naqbEZlfKFAgwLNTpXRbETlTUMiFRlfHMEEebRGIHtZNeykOxVG5FeACcKOEBP2jHjYK5EAQ3xtQCmTfT5bpfvOPt9XcxWWJF6RYeZKn2fbmfBo3Z/XxNvJa4BUKjYilHxsrsddZFN4XcKQaqQg3kP35w12U3klwHSqpkaCmYh9toI3pO3UVBSA4G4Lb0x3E/UfACHh7cnubf/H6wJWUDggKgAAADADAJ0BKjAAMAA+7Xa1VKmnJSMjiAEwHYlpAAApcN6fBwAA/vFEgAAAAA=="
  },
  "/images/astera-pick-card.png": {
    "webp": "/optimized/images/astera-pick-card.webp",
    "fallback": "/optimized/images/astera-pick-card.png",
    "webpSrcSet": "/optimized/images/astera-pick-card-331w.webp 331w, /optimized/images/astera-pick-card-480w.webp 480w, /optimized/images/astera-pick-card-579w.webp 579w",
    "fallbackSrcSet": "/optimized/images/astera-pick-card-331w.png 331w, /optimized/images/astera-pick-card-480w.png 480w, /optimized/images/astera-pick-card-579w.png 579w",
    "width": 579,
    "height": 816,
    "lqip": "data:image/webp;base64,UklGRgYDAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFsBAAANmQ8QRPQ/BI2c17ZVa/lwp3JqWv3/v8Lp3Hp399OTrJPT3pV927OzcLjZFXp2QkUiJmACVuLlq3CNddbKli0eueeW2+6466bf3aJly2xB4vW5WsZj/ZqrzjjhqNMu+qENdtjvgCMO+rLPHtutB3vAHnstcrV0ajxkDHcK1vuw2Ggzz3TVYfZa6dR9fRnKTf6t40Add019sHm0OV1WpVchHV6XZbE2O/G81aX3PpkiW2suGfQKoKuOoTlIvKKs9t9jGFu2oBleKoCmOpoTrytUmFVDhgMAXwADYBbEG5YqRJJwAJBJBJzEm5cMhEQ6oSrQhbcrCDCBQVZTBt7W81Qd9GCVp1sJLhvGaObZFhRIupZhnsr3shKAoPWFma11lcFAX+ocswylsC4jIycVAqaGzcBAMQEgNFkx8HDKfqNcRnIUhQz+x1IQIzDJCoK7Oop2lEaYyoJU2rvYAQBWUDgghAEAABAMAJ0BKjAARAA+7V6qTamkpCIxFA2xMB2JQBbQgmAoZPqKQDYo6R3a+xwR3JN+Xz1NYYc4AZbY5rwvjaqp+34WeOLa5IjYzdv/oouPP5H3lXOZeWResUukOObOZb7bK/lX+lRhAPRmmADu4IR9WLvwTlChKG74wzqk10NG6NMiXCjFw4Ys/VORQeqjY75WuRvonw597b3eC6q+VDzq3sUJQQOC6O9kl2PeigE8XtXraKe6xUiiesRKiuHj51ANxh8nVy05oXiROARYcwCFVxp4sTLq1OmcE+GKYc1Ap02X32A4jfDUPxVSAypNCkJmxuW+BuWF7VaCg9chhPdvkBdyRnm02eXT9zxgThM1EP0R6cGmu+loEwD/T8Qy0gPwx3zusjwM5n8mzJ6xxAkswel6IAKZf5Tr26/ZkM9JFN2WIbZUMlGs4ZpPsQtSSEYEpDx2ZRygtZ+Er5QxpqY6ANuepHmse85LOoVXEdOoa7yFeEl7X2/80aJOkBEIkk2wOlmAAAA="
  },
  "/images/astera-with-computer.jpg": {
    "webp": "/optimized/images/astera-with-computer.webp",
    "fallback": "/optimized/images/astera-with-computer.jpg",
    "webpSrcSet": "/optimized/images/astera-with-computer-331w.webp 331w, /optimized/images/astera-with-computer-480w.webp 480w, /optimized/images/astera-with-computer-662w.webp 662w, /optimized/images/astera-with-computer-828w.webp 828w, /optimized/images/astera-with-computer-866w.webp 866w",
    "fallbackSrcSet": "/optimized/images/astera-with-computer-331w.jpg 331w, /optimized/images/astera-with-computer-480w.jpg 480w, /optimized/images/astera-with-computer-662w.jpg 662w, /optimized/images/astera-with-computer-828w.jpg 828w, /optimized/images/astera-with-computer-866w.jpg 866w",
    "width": 866,
    "height": 668,
    "lqip": "data:image/webp;base64,UklGRhIBAABXRUJQVlA4IAYBAAAQCQCdASowACUAPu1mrE2ppaSiMdZqATAdiUAVJagq88xF68BkSmwb8ea9Lan3JLfiP0J7Xbcg2pb0OelaXyLuw/ziV+bYGHi0rs2w4ZR78wAA++6PjoVNneMrOa1EZZnokyt0CV1bqamgIFwW6MDMn0xZBHGCdNmCo/KLlBzvWvd8kdYC/OlZp1bBYlx0gOQxOY6lb3NmAvyMAKdcHlJNP5BE+18KC2aBXE9Iv7jxYp6Bol+Mg6xv6OsJ/S9++S8+OOpowBAtZ27hp08m3hM8bpeDU8ByOAVA0ocVJH9jeCB/SF6RPg/F37rmRq1xj82bqbBha1xepOHvFF81gh/MKdPNfwAA"
  },
  "/images/crystal-ball-astera.png": {
    "webp": "/optimized/images/crystal-ball-astera.webp",
    "fallback": "/optimized/images/crystal-ball-astera.png",
    "webpSrcSet": "/optimized/images/crystal-ball-astera-331w.webp 331w, /optimized/images/crystal-ball-astera-480w.webp 480w, /optimized/images/crystal-ball-astera-660w.webp 660w",
    "fallbackSrcSet": "/optimized/images/crystal-ball-astera-331w.png 331w, /optimized/images/crystal-ball-astera-480w.png 480w, /optimized/images/crystal-ball-astera-660w.png 660w",
    "width": 660,
    "height": 440,
    "lqip": "data:image/webp;base64,UklGRl4CAABXRUJQVlA4WAoAAAAQAAAALwAAHwAAQUxQSGUBAAANmQswRPQ/0khWJEmSHe0r6P+/U7Dvu1Sj7RpJXTvIOT2oIPskKBLm9CAL5jRETMAE3Ih/0JveI+i3OA+E5H13vPOWveZOHgClZfZBOOwNLrutGbVYUSaCNm3VasTM8Fdm3INkYI7KaqSkPVdjJLUeom2j5E2YrBfsme0YpPjA2V/a3Joo55hXk4CrQo+d7TLNGxDhYxsASLhcp7VNiwaR05B3AUSAMF89TYgGe9EsQHw1LDotgz+PAnYH8U1HkSvRsChl4DvHYi61MECiBRBkwCajd7SMEo7wCBCBmJ79ZNGCZrUf+4YAEGW7ko6WwjD27NsX5dn7E081Ypg/cjQCCLMFzUJTmiKq+he0ZIwNjdMhFUIAlkdMtkJCHoEvKdrMZg4oVV+UIDEaRQzUcXGG+UX7zg2N6T5RazEUmSf+R3v5JUYXoH7G9WynCRuYS9IZ2xUOMCUrU1K4HjwEuWjhkbXhJwMAVlA4INIAAADQBQCdASowACAAPu1qrVCppaQipWzJMB2JYwDMKBACIWKGfoiznFq8LGxJD1gqa99l0xnV1gEAAP75wl/uraMGEjWo1HUXUsIJldyFQv4gBHJRG25x14nS37H/PPvuKMeYRPVbGOrNcytlMX5kVO1p6p913Vj9ZP//tBH/7R7//7QZXxUFR6U/hToSXCtMJmxbDHU+Q0FowBXsSaPJEeneRmUjfuvw8HUDwnKXNuGzymtp9/X8lkA/9QeCMHTqf9Tr2Akyb4teXf6hKf+UCK9qAAA="
  },
  "/images/kniha-astera.png": {
    "webp": "/optimized/images/kniha-astera.webp",
    "fallback": "/optimized/images/kniha-astera.jpg",
    "webpSrcSet": "/optimized/images/kniha-astera-331w.webp 331w, /optimized/images/kniha-astera-480w.webp 480w, /optimized/images/kniha-astera-662w.webp 662w, /optimized/images/kniha-astera-702w.webp 702w",
    "fallbackSrcSet": "/optimized/images/kniha-astera-331w.jpg 331w, /optimized/images/kniha-astera-480w.jpg 480w, /optimized/images/kniha-astera-662w.jpg 662w, /optimized/images/kniha-astera-702w.jpg 702w",
    "width": 702,
    "height": 702,
    "lqip": "data:image/webp;base64,UklGRh4BAABXRUJQVlA4IBIBAAAwCQCdASowADAAPu1gqk2ppaQiMdZsATAdiWoAnTK4v7AnO9Q+rjlM3EA/eiB8cW7Nhgx8nqsK3HpJ9AmAFuyJ9x38oHxhMFxoUHsi6m4mAN8IAObliMWHO8VliFU/pRG+3WxeOLEf+Rx/A7O+IWnArvb5raFKqRKI4uSPuWs5Zn3cmoHok+Eq9TkLEJbH/rte886Q3Gs44iNe0kEaykwkhK0BsQISHLSbvOoP2rZtGfswYAb3tdbYjPqukOHRc/frxOsFUKrvGKBgtBzzAttmpOpTSH6I5rlJvEi5GW8rt59oot9/NoL8ZarL/uAwxRftVvSJJiICZuyfIXyMl5S3CTGWmN2jz8MKXGPxruhsAAAA"
  },
  "/images/koule.jpg": {
    "webp": "/optimized/images/koule.webp",
    "fallback": "/optimized/images/koule.jpg",
    "webpSrcSet": "/optimized/images/koule-331w.webp 331w, /optimized/images/koule-480w.webp 480w, /optimized/images/koule-662w.webp 662w, /optimized/images/koule-828w.webp 828w, /optimized/images/koule-1000w.webp 1000w",
    "fallbackSrcSet": "/optimized/images/koule-331w.jpg 331w, /optimized/images/koule-480w.jpg 480w, /optimized/images/koule-662w.jpg 662w, /optimized/images/koule-828w.jpg 828w, /optimized/images/koule-1000w.jpg 1000w",
    "width": 1000,
    "height": 667,
    "lqip": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAAAwBwCdASowACAAPulgpU2pJaMiNVgIASAdCWgAw+h1LWeJr9W554B8H47FUHahFrsNACOXbdkVhrZ57C87ZRjg3gAA/v4u23b9kA+vpIgGqnp0CJAW2AdiZR9TharoJpwZ4JJGRTMi/7DtCsJ67m+URq7AN6cTyHLAWtAdC7HhogIDrUD70+4e2spRHz7pW9Hi1I7biIswzAfL5NXpRLWX3Es9RimpcQhf0vMl2DnoJzTeGJPhYnCHGZAAAA=="
  },
  "/images/moon-phases/0.png": {
    "webp": "/optimized/images/moon-phases/0.webp",
    "fallback": "/optimized/images/moon-phases/0.png",
    "webpSrcSet": "/optimized/images/moon-phases/0-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/0-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRhwDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSEkCAAANGQJJW7ztj+h/7J+GjiLJrm3rfa3mP1Wt1RF7BNUs+NYtasO3dlPXXTRctxu+dYmYgAn4EHd+7COfQP7qN/iFFBCQycTjWfWZTw0AI7OqEvGj62ctP4is9bmEELacuWatKegnu+1HsGZo6drXlgzm+sKXvvGVIaQt38eshPr6QbeChAjkev3vPFdaId/DTKCvqz1rEoBCanNqnedQlm8jSPXecyaJv1X0/t775ayZlbjDICOaQ+JWQ/2uHZgpgLcYNqwhcbdlW3YxDfLvLIMGiQfbMgGAzL84BBaeapiWWH+xw1n0UwDQITGLUIsz/TSkY7uGiMYsGM8mGTtQwx15Tj8PHPWlGjTX2cYBMuNqrwqe68IRWdgvLmJOxCEw3DtArtU+RqZ6mzxnHwTL+xJyZeOYLHdLuVIHQVLbYMGHgdqRNI5KhCAmjisDYSR5ENuAw8yjSM7UDlYdJII56Ms5PIRbXMv70iwc81K+Dvd3Nt/yEPHieTsR33rx2zrEfsHb11DtOkdxgMzefS5u5TkMPy1H+9JrZrfXOSE/iay4dhWgrVrDeFqpt04C7vCssv2czNh9JgC4I6coPJOgOlz8m5A5BT/BIBQa/KMCBEnwUTAkDG+wCdhM8gG2jAQycaNtwAEWyTtshTMT9xOKbuQqgv9gRLdQVZTvI9y9Q5hVmYQVfb28Z621GLifmXRfe0fIadtSyFznKrQfAGYVtK9rR4f+gsx5W2fuNh7KnCq49947wsiZ89//2ZeMB5MzU0RYBlA15/hFxu0AVlA4IKwAAADQBgCdASowADAAPu1eqE2ppSQiLjv8yTAdiWdkeV2aDmbt7TIH38c+/c0kNGQP1hUNQ3hsR2SU2OltEmd4IAAA/u+mhZPbrP8HuG2bk6pavyFQm2hdSc6zzztrfITfh9rrcXdmikMYEOWGPvoxeX5399x07lk4Q3RAcNVzHuz6dWzG6r2IGmLMtto8RST0Jk/KmLZ1RZCaLSKeJ0diSXEVgKoyy/9cStnQAAAA"
  },
  "/images/moon-phases/1.png": {
    "webp": "/optimized/images/moon-phases/1.webp",
    "fallback": "/optimized/images/moon-phases/1.png",
    "webpSrcSet": "/optimized/images/moon-phases/1-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/1-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRt4CAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IHoAAACQBQCdASowADAAPu1qrk+ppiQiKrqqqTAdiWcAACkrzS+uNa/7a9QXEr+LZcoN65dDaMGhgAD+uStLyIzzrTrLB8da5GziBT0YLOu60S/Aznx1wlP4PxgYyFVNRLPHnQvl2AHmjpzoOieczlA1bQVPZvRziIgngMjAAA=="
  },
  "/images/moon-phases/10.png": {
    "webp": "/optimized/images/moon-phases/10.webp",
    "fallback": "/optimized/images/moon-phases/10.png",
    "webpSrcSet": "/optimized/images/moon-phases/10-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/10-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRl4DAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IPoAAAAQCQCdASowADAAPu1srVEppiQipytpMB2JYwDJiYuw0D8mcvki4jNh2v5dGp2il/QnI7mr1pyQebESxlkc4Z86aVh2E+tOx8Yy9yQGE6Q+pgAA/v0BsRvbZ/mGRBVmq1AB7QEKALM3Q7f48CZJM5W1gVGgeIZ0xbyTuRqdlGOY4dr/asbOoQYKIg6IJNFcH8j4MFUwk+VGmVTPypTSudApAAikDufkVhXVVh/tUPl2+0VuEbDtZEVx/CERGwz89N3PBJUcHG44lieLMVd1S04KWA4O6xzYyEXqx4YCoHg0GcQUR1kXYbDGxsHa0C6CJ041o5HGo7RRsAAA"
  },
  "/images/moon-phases/11.png": {
    "webp": "/optimized/images/moon-phases/11.webp",
    "fallback": "/optimized/images/moon-phases/11.png",
    "webpSrcSet": "/optimized/images/moon-phases/11-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/11-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRjwDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4INgAAAAwCACdASowADAAPu1epU2ppKMiNVVaqTAdiWMAzu2LiKx3IdC2MJSl4GjlbZGBDlmP1P+RjZnrbTJ7QE6e7BkyqpEbLWlFcxJ6NAD++IWEmBzKVtRqRdFVWNu10HhVTq3gpRTMx2SsKu1wlNiqLxKEx9z9j7A79xVR25j0jk/vS/aVh8Pzm98S6wcyBDj+TaW7tVJV8kdN4Ieq1WvLTvHjj51KhLwTc7ext+UyiIeA2/wtNu1r7Ukyz0KcwE/olYLvqq9tss2CFeHCKjiy2bQH3nlYjs1kwAA="
  },
  "/images/moon-phases/12.png": {
    "webp": "/optimized/images/moon-phases/12.webp",
    "fallback": "/optimized/images/moon-phases/12.png",
    "webpSrcSet": "/optimized/images/moon-phases/12-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/12-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRiIDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IL4AAABQBwCdASowADAAPuleqE2pJSQiNVVaqSAdCWMA0nGLJKx+bG0Ypc6D2MJrdcDA+G07PFPloYMgVtglMOAQRPXaEnGAAP73esI12/O3Z5H7/w1wBo5Dtofo30wtAw5gSOLj2xfCzJGUXNFodRAc96ht3YSFN7wGvQ+xRT4WQam3ua1cfjbMyElIi6JLGrpO3eiEoEbotPHpbfLy42qOH9GX62oQPur025W7+NN1zyq0xi81/pN2ZEF319o/gAAA"
  },
  "/images/moon-phases/13.png": {
    "webp": "/optimized/images/moon-phases/13.webp",
    "fallback": "/optimized/images/moon-phases/13.png",
    "webpSrcSet": "/optimized/images/moon-phases/13-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/13-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRhIDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IK4AAADwBgCdASowADAAPu1gq02ppaQiLjgMyTAdiWUAgi9kqxeKzuDDxpkdG+DvVQdmMYob2to2m4A5FsJLslQk7iOwAP72u88O3D0+nk70A3ZCPNntq2FT7XF8fdf1YPZeppahiXqTvMQ4CcWgA4ztVmEt8TvmiBxwSySzWKDZ0DF/pP+DUpeGxARZ/hi21j4HA2w3mYPppGGJF8ObdYWsNX+XW2URWxibD9QCuc9AAAA="
  },
  "/images/moon-phases/14.png": {
    "webp": "/optimized/images/moon-phases/14.webp",
    "fallback": "/optimized/images/moon-phases/14.png",
    "webpSrcSet": "/optimized/images/moon-phases/14-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/14-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRvYCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IJIAAADQBQCdASowADAAPu1qrE6ppiQiKrqsATAdiWUAA+JcoomLfNxsEJSte8LfDeIJl9jjuRrwbBeAAP72PQKieqD/oKOMs5GFSfwpLIyZjP0TaoNQWLvx9r3Lf+Hetbzdu3WRmAhd1XBaGSDEBaGcn5dYzziKSRV6048skmyetbITKDoX9yJ6r6+2dIMJSVwSh4AAAA=="
  },
  "/images/moon-phases/15.png": {
    "webp": "/optimized/images/moon-phases/15.webp",
    "fallback": "/optimized/images/moon-phases/15.png",
    "webpSrcSet": "/optimized/images/moon-phases/15-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/15-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRtoCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IHYAAABQBQCdASowADAAPu1ssFCppiSiqrqpWTAdiWcAAJ4ILaCbaZ2aGM67+MtREmFzMl+uRAAA/vS7AUInjempeDN7oQtP1CCOscyrTC7Caz3rabsLbs82Qpnpp6eyQi3njfyWt/iQDdCNbfEvm/d3uQ5GOPU4AAAA"
  },
  "/images/moon-phases/2.png": {
    "webp": "/optimized/images/moon-phases/2.webp",
    "fallback": "/optimized/images/moon-phases/2.png",
    "webpSrcSet": "/optimized/images/moon-phases/2-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/2-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRvoCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IJYAAAAwBgCdASowADAAPu1mrE8ppaQiMdZoATAdiWcAzUmLVGRTpyz9btnfkxr4ENuCONHq1WYftD2a2y3IAP6dU04a7OLK3nl8KJrAWYwQGucrdElUaO7O0JGFXrnfX6HEFUfaiTRK381/VtNaKMDtB1cYdjwB7EcPz/8tTkc7vV+CebaB/32hb6418DhlG2UMJxcmtlKAAAA="
  },
  "/images/moon-phases/3.png": {
    "webp": "/optimized/images/moon-phases/3.webp",
    "fallback": "/optimized/images/moon-phases/3.png",
    "webpSrcSet": "/optimized/images/moon-phases/3-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/3-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRgoDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IKYAAADwBgCdASowADAAPu1gqU2ppSQiNVVYATAdiWUAyYmKvmRTpx6UsuV/ZxrvLjyv8YNsXhDZTItbZHvL2pTA/IwAAP5vMycZJRyV+w+dQXrQ7bdCi8bV48ln8tgrf2z4kW855IEXFR8VdPnpIUEs+BFlzmHuk5BTaG2KZiSrChFOztO2lYIy3W9jdQTewWy1TgzlyVSE19NcocZcVSEmM6m165sYtAAA"
  },
  "/images/moon-phases/4.png": {
    "webp": "/optimized/images/moon-phases/4.webp",
    "fallback": "/optimized/images/moon-phases/4.png",
    "webpSrcSet": "/optimized/images/moon-phases/4-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/4-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRhQDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4ILAAAADwBgCdASowADAAPu1iqU2ppaOiNVVYATAdiWUAzcGK0mLtUzhjIfxf0CDtC5loBnXkdCujHkDxvT86UaQhZ+aAAP5vYCcgr1To+HPS8DxZRppql4xQ+IFuIrvfSnci3eUbQ8d/HWKbLPYXDtBC/IS9NVhA5ag3jGG9kNP2Ol69kb40oECYwReMWVy3z6Wm3I87hRDgmPAdabjvxUKDhZJL+PqsRVeBXW0uc24vgEgAAA=="
  },
  "/images/moon-phases/5.png": {
    "webp": "/optimized/images/moon-phases/5.webp",
    "fallback": "/optimized/images/moon-phases/5.png",
    "webpSrcSet": "/optimized/images/moon-phases/5-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/5-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRj4DAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4INoAAACwCACdASowADAAPu1gqE2ppaOiLjgOYTAdiWUAyRGK5mOx5DgSQbHqLcVtC5IJXhamq41kyH/sxGzvQ9AAWrA0ETzSQxvwGpqS2uZNpgAA/hEn0tlYfPMwj4AV1X1NXx29NHPhXkXbPuLHkSilB1QPh3raFpdLBFmLLfBc4kOOnhMYt01Zh7uzGBJV1Ga5weyGryDm5XfciUVWFqLDd72uHvZqJh4W3lf4S7RBVFJFxvIvn55trSAAddSzoHrNU9Gw2vB5v4DqdcLaVtgwMk8zuom5v701gAzwAA=="
  },
  "/images/moon-phases/6.png": {
    "webp": "/optimized/images/moon-phases/6.webp",
    "fallback": "/optimized/images/moon-phases/6.png",
    "webpSrcSet": "/optimized/images/moon-phases/6-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/6-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRlgDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IPQAAAAwCQCdASowADAAPu10rlKppyQipykhMB2JYwDCRYtyYX5PWKh/XYtSOwwiDcuCj+j7G06EaUkHgcIxLSEP8e34icxnVibK167COUm3cbXn/7SAAP6djSlQWvD0IfuBjCvpcXMq3PdQ7hy9NhisbyFGZeDLtBtmuBaa2ETn3LhSMxgBB+EZcrjDPsNHTEs5HMDtNmGj6958b5gf0WYjSPUcc4XWnmKSBaoJdN1C5U0ng4c6qPDHU9ofECSTx6e0ZS9ETAEVzLt0aOmXYLAF73pN56De70CyJRZ5pFsazKzwYIE6a8aN+OZOFG1KdLOWCOH3YkAA"
  },
  "/images/moon-phases/7.png": {
    "webp": "/optimized/images/moon-phases/7.webp",
    "fallback": "/optimized/images/moon-phases/7.png",
    "webpSrcSet": "/optimized/images/moon-phases/7-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/7-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRoADAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IBwBAAAQCgCdASowADAAPu1srFCppiQirjQIATAdiWMAwVWL/vwWFpC8FYJIBEk+xF0AT8nD0aDWIFlW+Fd3Cwym5vRKjM5xdN7FEdIQG8XQS1R6ShyDoOodS9ULAAD+uSlxo7rOXCd8UjUtoFO6p0HmpiwBD3cvpsQHww2mtZzNp3PRYgDd9/Y+amuMo3Z63sKPZeJzw8DhkjOaq7GME1gTz+6O+C0UUpGFBcJEotCu0CQY2Y5ffCZDZ7HDhDGyW88RAv/V7xi/1sR17ooROFMandmTisGiRrRwNO2hzYVsqVTr+XrvTjE+rlXzpbmjY2mP2VEs6sTEzcBFETdHB9CWx46cxoDIqAU6zegU60mfbyo6aEBYu79k5F0zukAAAA=="
  },
  "/images/moon-phases/8.png": {
    "webp": "/optimized/images/moon-phases/8.webp",
    "fallback": "/optimized/images/moon-phases/8.png",
    "webpSrcSet": "/optimized/images/moon-phases/8-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/8-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRqADAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IDwBAABQCgCdASowADAAPu1srlEppaQirjQIATAdiWMAzXv8vZb1/JMnFClgiSRce/lDEsQy8irKViiqHxB/LMX8CxMth2SxdUKaRF+JrM7u635XGbWOPsF7sO2TscrgAP7r7aVd3kWOCo6tPX31TREfL0wwei6Jn26ctQeUQOTwW4iliJJThXctfO5ISLxdsNVv7nDRI59iP7qTbJA70sbeyr0mRftQsXpz6z6ny1vWNC2tCs+XrUJlGNqFqzw3J7svVH1EOZQuPv4JaFG/9D4U6QThw+sm2IpCK+wdZf2We/eScS+4Ym88LJFe1DyBCNLWM3fq0pg/8eKBrg0LTN93x+oLW6E7Tw+3gqHAwSMJE2tS9Yd6oDaz7YTERQSg6TKyAskPVFlQxgJkXkviLiNCi0e9Kb8UO5gu8TxQgAAA"
  },
  "/images/moon-phases/9.png": {
    "webp": "/optimized/images/moon-phases/9.webp",
    "fallback": "/optimized/images/moon-phases/9.png",
    "webpSrcSet": "/optimized/images/moon-phases/9-180w.webp 180w",
    "fallbackSrcSet": "/optimized/images/moon-phases/9-180w.png 180w",
    "width": 180,
    "height": 180,
    "lqip": "data:image/webp;base64,UklGRnQDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSD0CAAABDrn//5+Pk/x+ydmebN9ca8te2xyzn2dunKrptLePaK9t2218sT79Bz5fRwQDt40UtQfLvJ15A6aiZs4vralr7uhC3sxqSqlZM2RCoym3vL5vk2XX4VNnCcddQsn68lyTMe2QnlfdsXnn+YGJhauLK1SwhQl5HgmvztPTC2jZFe07jg7OLDtuPHr57oMgLx9xiWzwKG2vyNbSgF5Qu+7g8EXbvbff//qCoSjRR78raePDgtQW6ClhKmmzWOdtj7+4A2sklEBCpPuLsiEXbdSUAuaynp1jK3c+R0OhFCTSTe+s4M6eMnPycFn//vFrL37740IpA1y9kOMUy5IF9ZLeA9POd+5gKE2iJM7pA4ImVtAK2naNu957ElLTSlTv6fiuNh7fjzG71jJ2/V3szeR5h2OCZhvj0irWW1dfyIxexohU3EorROyf13Fo4e7vIMuQqAQ9xPOIAU3VO0bsnwMsY0oqRnZUmxDz+LFLT+LTMk3CS4LnGbTyLYP2r8EQAFHYB7coLath1+w9dwiE8p4giub3XVh5G4CBVPRCX37pRnR8X4MBQTm4kddYJm78hQLlEwJrdy488oWA6BMUa5sPX30ZhAKSq4d5+6lFtQYFogRv7zq78j4ExveUIDzgI/BF4BuCPyfw5zC/78Iy3DnHC300q2HXDNw9miGKxu6pDeqe2mL3FFwH4HUGXsfAdRJeh8F1Ppkd2Z+5HaGiRAe3U+B2ENzOgtvxtP2EgdR+wkC8nwDuh/xPPwfcj0IAVlA4IBABAADQCQCdASowADAAPu1uqlGppiOipytpMB2JYwDHdGyOR00zvhBo/1L3K7obTOwhV7LxuUSzkoxl9Fa5tDUJPNAKRyDlL9cFAx0JtZ0FB20m7me8p6noXAAA/umNu4cyJRn9VNV6MY0+CRhIF8+LnEtzt03IodBHRSdWfBbsDfS5A5gwTZNKpIKNO7WMlthjRGHPUapvq1Q9KL6hS0RKzq83y+mg52jITuuQzV4DD41rhkd+c1n/+wrtXuFCGJJ/MfjbQi6+kGqhaldfbtWSZMIVSwM+sHXHLTCfqczvatSH88+pF4kpwIc0M7Z+K/dwSLmJCmt681DCGv3iMmlrb2inIuRvJMn0W4g0cg7uKAAAAA=="
  },
  "/images/new-book-icon.png": {
    "webp": "/optimized/images/new-book-icon.webp",
    "fallback": "/optimized/images/new-book-icon.png",
    "webpSrcSet": "/optimized/images/new-book-icon-141w.webp 141w",
    "fallbackSrcSet": "/optimized/images/new-book-icon-141w.png 141w",
    "width": 141,
    "height": 27,
    "lqip": "data:image/webp;base64,UklGRoYBAABXRUJQVlA4WAoAAAAQAAAALwAACAAAQUxQSP8AAAANmS8wRPQ/1MhxJMmxHQhqdTLelh7PpbU8RDWesFio77JQdAdNafX4EROQjz/x1oUrt6z37sArz6x+6CZ8BOQSvqH5gSomGRiKzKdeyl0HAq/c88g7SXrVDWEAIiBbUwQgdwVBaRpCgI7SUGg5mA2k6g/sMRB4DFQc7XSBiBblTguUTWBqrwM3i7BQB6agrY0S7F1BN9FJIWglka4DbyJIxhmwro0egNLwDR3cBK3Onq1do8MOUKAKBIW5jdOiqsrJa99/OoAZZ1szJdOR0VU49J/68Z+HITJDskeriRYy2HulQIaFEEnO6rVqx3tGdDM7iAwC4GFCdRhtsWz74DEAVlA4IGAAAAAwAwCdASowAAkAPt1apE2opSOiNUgBEBuJQBhsUAAVORgAAP6k191xjtVf7ovtRV9+NkyEYdCN1kbJgblR7rAwkysynRPiEIAIke8v26qna7apxKD3wETIiMiZDtSEBgA="
  },
  "/images/oracle-video-thumb.jpg": {
    "webp": "/optimized/images/oracle-video-thumb.webp",
    "fallback": "/optimized/images/oracle-video-thumb.jpg",
    "webpSrcSet": "/optimized/images/oracle-video-thumb-331w.webp 331w, /optimized/images/oracle-video-thumb-480w.webp 480w, /optimized/images/oracle-video-thumb-662w.webp 662w, /optimized/images/oracle-video-thumb-828w.webp 828w, /optimized/images/oracle-video-thumb-1200w.webp 1200w, /optimized/images/oracle-video-thumb-1280w.webp 1280w",
    "fallbackSrcSet": "/optimized/images/oracle-video-thumb-331w.jpg 331w, /optimized/images/oracle-video-thumb-480w.jpg 480w, /optimized/images/oracle-video-thumb-662w.jpg 662w, /optimized/images/oracle-video-thumb-828w.jpg 828w, /optimized/images/oracle-video-thumb-1200w.jpg 1200w, /optimized/images/oracle-video-thumb-1280w.jpg 1280w",
    "width": 1280,
    "height": 720,
    "lqip": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAADQBgCdASowABsAPu1ipk+ppSMiMBVdUTAdiWYAnTLCReB0irxoLylXi03PSyKKSRUhrHWgLDZFaYNa6g3OjQAA/tNGm/mZYo8KP1MlJ7Ephc51oQqEad/o7eHvG5un2g4cpD2DwlhYEEx8Uec4C/LXMTrXoXsU1/V9fJGk/OFvV7x0REOIg0DGfcezF0nkOGeg5aQBx5HHoCqrOL0WoEW4gy/L+XBR3sB8bdQsBiMKFFlMPYP0jw+ojAFkOc8gYun8ruvB1dfN4lQA7kAAAA=="
  },
  "/images/vyber-si-kartu.png": {
    "webp": "/optimized/images/vyber-si-kartu.webp",
    "fallback": "/optimized/images/vyber-si-kartu.jpg",
    "webpSrcSet": "/optimized/images/vyber-si-kartu-331w.webp 331w, /optimized/images/vyber-si-kartu-480w.webp 480w, /optimized/images/vyber-si-kartu-662w.webp 662w, /optimized/images/vyber-si-kartu-702w.webp 702w",
    "fallbackSrcSet": "/optimized/images/vyber-si-kartu-331w.jpg 331w, /optimized/images/vyber-si-kartu-480w.jpg 480w, /optimized/images/vyber-si-kartu-662w.jpg 662w, /optimized/images/vyber-si-kartu-702w.jpg 702w",
    "width": 702,
    "height": 702,
    "lqip": "data:image/webp;base64,UklGRuAAAABXRUJQVlA4INQAAADQBwCdASowADAAPu1goU2ppSKiMdmaATAdiWUAwGQWZcl7/ZmH/MEmUlX+Cx4AGz2Q5mzE3CE9gaLshnnIoPp8TbiNLwM2AAD+x9wLCx6QubtIRth/9Y9j2vpwp35G7zAvHNgp/8rl72JBiAl9rzf87jrU2k75cMmMoSOUK31+PjRtAXBHRCJdUQGtM3SJFzM7gLRQjr7yfmeu6WIvJJnroq3UX7ItbRPEij4s+vQUKgcHC+bG+xIUoDbQTC3A/WevMWYQi4NHw4KHyy3uKwB5IAAAAA=="
  },
  "/uploads/astera-upload-1777542736772-d2souok25x7.png": {
    "webp": "/optimized/uploads/astera-upload-1777542736772-d2souok25x7.webp",
    "fallback": "/optimized/uploads/astera-upload-1777542736772-d2souok25x7.jpg",
    "webpSrcSet": "/optimized/uploads/astera-upload-1777542736772-d2souok25x7-331w.webp 331w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-480w.webp 480w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-662w.webp 662w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-828w.webp 828w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1200w.webp 1200w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1600w.webp 1600w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1787w.webp 1787w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1777542736772-d2souok25x7-331w.jpg 331w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-480w.jpg 480w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-662w.jpg 662w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-828w.jpg 828w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1200w.jpg 1200w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1600w.jpg 1600w, /optimized/uploads/astera-upload-1777542736772-d2souok25x7-1787w.jpg 1787w",
    "width": 1787,
    "height": 880,
    "lqip": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABwBgCdASowABgAPu1grU6ppSSiMBVdUTAdiWMArk+miR+LVZMqUiAuZAHvBl2GO83RoHmvzjcHFlLUxIgA/vTdFs207vix6qHBqIBfmkM4bOkUrQ6RcnIviYFSeD8IGwZsVBDyP1zfTYpIgV+0T50N233gUzdSB3PGglfNLImIsCjcKv1axI8Q4yGRKOLcPl0GQxtaMHYydgAA"
  },
  "/uploads/astera-upload-1777542744600-mjff29y2d1k.png": {
    "webp": "/optimized/uploads/astera-upload-1777542744600-mjff29y2d1k.webp",
    "fallback": "/optimized/uploads/astera-upload-1777542744600-mjff29y2d1k.jpg",
    "webpSrcSet": "/optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-331w.webp 331w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-480w.webp 480w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-662w.webp 662w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-828w.webp 828w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-866w.webp 866w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-331w.jpg 331w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-480w.jpg 480w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-662w.jpg 662w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-828w.jpg 828w, /optimized/uploads/astera-upload-1777542744600-mjff29y2d1k-866w.jpg 866w",
    "width": 866,
    "height": 670,
    "lqip": "data:image/webp;base64,UklGRhQBAABXRUJQVlA4IAgBAAAwCQCdASowACUAPu1ip02ppaOiMdZsATAdiUAWI/OZDhIQAJqGtWQF1Rvqzwl5gnsYPiDP3NQZ2PtBbY/ajf/QAkJDM+Fpy7C1Ofh7j6Hj45cgAPvv9dbzzG4M4z+mavv7QW4DHZrrIqM5F8NoXLrp6EV1F8egfPIbkxjWN9oTyv9oDqH2L/4sT74W95arNK2P23HRsR4v+xh0k1L4p/dEvB3LQiQ5G3CqMinZ1jFr1XYPd3MNLcZVQArq8wDk8cHD+wgZJZVtnMmxOcCx866Tol6GLGK4lOnF+aB4dCeVoMMQnqPKOT78c6JfLCMwESyIhb36XO39V1Bhw7C3bNK3sFXWT1VToAA="
  },
  "/uploads/astera-upload-1777543712527-v1mmzjakq5.png": {
    "webp": "/optimized/uploads/astera-upload-1777543712527-v1mmzjakq5.webp",
    "fallback": "/optimized/uploads/astera-upload-1777543712527-v1mmzjakq5.jpg",
    "webpSrcSet": "/optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-331w.webp 331w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-480w.webp 480w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-662w.webp 662w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-702w.webp 702w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-331w.jpg 331w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-480w.jpg 480w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-662w.jpg 662w, /optimized/uploads/astera-upload-1777543712527-v1mmzjakq5-702w.jpg 702w",
    "width": 702,
    "height": 702,
    "lqip": "data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAABQCACdASowADAAPsVSn02npSMiPH34APAYiUAWI/5pmWWWpdGtz7Lae1UOm80Shf7C89NYp7M1VoIkLwoC0vic9taRoeb99T50yhwA/hBBPFiaNOnMCKyWj1gGknVJ7skiGtlIYAD4ChuzK1Xerm7Yuxdz/0qGLD5qS5GfTzvBEwVlS38i/RvqlP9uGohr/SaIcAdUiTfx9Y2+42mqRd6lM9v6TVGQPH3ynHJEZ3CCMGRGEWgbaQwnUMNVK+6YkAa8+y1TlBxqLF/Mkiq79KN8FuvXw90Y7NEMlUHOgo+WORFF2lpzZCZMHvMWo6oj9Qc0yOhZLLjbpGZccAAAAA=="
  },
  "/uploads/astera-upload-1777543812845-9puk6rdon7f.png": {
    "webp": "/optimized/uploads/astera-upload-1777543812845-9puk6rdon7f.webp",
    "fallback": "/optimized/uploads/astera-upload-1777543812845-9puk6rdon7f.jpg",
    "webpSrcSet": "/optimized/uploads/astera-upload-1777543812845-9puk6rdon7f-331w.webp 331w, /optimized/uploads/astera-upload-1777543812845-9puk6rdon7f-408w.webp 408w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1777543812845-9puk6rdon7f-331w.jpg 331w, /optimized/uploads/astera-upload-1777543812845-9puk6rdon7f-408w.jpg 408w",
    "width": 408,
    "height": 410,
    "lqip": "data:image/webp;base64,UklGRhwBAABXRUJQVlA4IBABAAAwCQCdASowADAAPtVapE2oJaOiONtoAQAaiWMAv2vpzAGz9KlT8vt/99UznzasMUiYoIs/vkmnc71iZOrSceTkCQqWm4Dalv+HIkKwEDwzEgwAANBXVrNQtGPo94Qcaxn/1VxIsJEYhTmJHpPrwtNr3mOobO0TgU2FnAI0WsLipCYNtYkbwxUixHhJfIrtCt10lD0EEmiJOMyxQfI+FhCTzKeh50uvIuQrUjnmdXHBZ64ApLAQ4rzxVYG5MkbC6abpAs9ROBQAzVkMYgpS2AImPzxFLmn4oG95F2LzbEr5BKRRq+hQgRIV92rVusjooQoJ9tUtQ1Wx0JPPyJF6zXUorFB0yWLcNaRySCbwuSogAA=="
  },
  "/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg.webp": {
    "webp": "/optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg.webp",
    "fallback": "/optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg.webp",
    "webpSrcSet": "/optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-331w.webp 331w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-480w.webp 480w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-662w.webp 662w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-828w.webp 828w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-852w.webp 852w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-331w.webp 331w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-480w.webp 480w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-662w.webp 662w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-828w.webp 828w, /optimized/uploads/astera-upload-1780220684302-0u741zmozlhg-nobg-852w.webp 852w",
    "width": 852,
    "height": 1199,
    "lqip": "data:image/webp;base64,UklGRsoCAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFsBAAANGQJJW7ztj+h/7PuukevaliMrD+9tSERE5vn/f4AI8QEu9t770kuRzlWlc3QrravzIqRSYcK66ShiAiZgJ766z34HHXHYIUcl3njmuZdeeQ9457UXfm8Xa2t1L4P4Xh6Q7I/cc8ctt9310FMOIP6dd9FlN/2/5pILTsn3lut7IiLoS8EDAl+Uv9a7xxJnwt8yfRMRQR9j+d4J/5JfWX27WSa2Q+aUu74FJHz11WrgG91H32zNI2pNUtBXBAXcVk7iu325LcPMSYH8iiDJk/jBchMiCCA+c7kCIPHjJQfljCAgN0wSP1egy4WYhC1wpv8kQEEbHhkwZ5tLP42EhntkLGU1ocBJGyNyKmodKDECfXgkWlteBDJWH0y21lFmTPXhzEorBAnrxtoGSp3TNoszN8Uw3YZqrGKQsIGASnITBsoNwRetIBAa9KIcRpUEyInC8KtdFrf7q7jdnwBWUDggSAEAANALAJ0BKjAARAA+7WSpTamlpCIxEg2xMB2JYwC/bDUlqgIxo8SLNaqEM6XggG+uCs4o9uvHR6pKO6dl29MP4GzBy7A1NXNqTx31HJ+XQq8Gv3zbVi3z2Aw2/awmk07RR8XZ7oM+EMAA/E9KsmrPfAsd+aiSMwT3r/VND1iGW4OyfylIlEBxXLTb8wViI/HMzg7Efxprn+r53IEBH6nb/GdiBxMdYXNuuCwgfJaG4QKm0FE/St4bea4ywRKHI+6PpZ/FBH2jR+b3Ud/AbjkkeP9SwXEK8c1jn7qsOv4w+2iu93rnJhHlofNRmbSECua0K6npxmT/g5jlCgny/Z2Zz11sLiD343oEH1HVZCkxtFw7zDlvj5Xh5T1kdPR77zHdzRIkQ/JwcGfg8S52ad0LOI0rmsdnJShvCG8rwPHmbgaIYqHmRdTKAAA="
  },
  "/uploads/astera-upload-1780231907449-7vup1spq1vd.webp": {
    "webp": "/optimized/uploads/astera-upload-1780231907449-7vup1spq1vd.webp",
    "fallback": "/optimized/uploads/astera-upload-1780231907449-7vup1spq1vd.webp",
    "webpSrcSet": "/optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-331w.webp 331w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-480w.webp 480w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-662w.webp 662w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-828w.webp 828w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-852w.webp 852w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-331w.webp 331w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-480w.webp 480w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-662w.webp 662w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-828w.webp 828w, /optimized/uploads/astera-upload-1780231907449-7vup1spq1vd-852w.webp 852w",
    "width": 852,
    "height": 1199,
    "lqip": "data:image/webp;base64,UklGRswCAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFsBAAANGQJJW7ztj+h/7PuukevaliMrD+9tSERE5vn/f4AI8QEu9t770kuRzlWlc3QrravzIqRSYcK66ShiAiZgJ766z34HHXHYIUcl3njmuZdeeQ9457UXfm8Xa2t1L4P4Xh6Q7I/cc8ctt9310FMOIP6dd9FlN/2/5pILTsn3lut7IiLoS8EDAl+Uv9a7xxJnwt8yfRMRQR9j+d4J/5JfWX27WSa2Q+aUu74FJHz11WrgG91H32zNI2pNUtBXBAXcVk7iu325LcPMSYH8iiDJk/jBchMiCCA+c7kCIPHjJQfljCAgN0wSP1egy4WYhC1wpv8kQEEbHhkwZ5tLP42EhntkLGU1ocBJGyNyKmodKDECfXgkWlteBDJWH0y21lFmTPXhzEorBAnrxtoGSp3TNoszN8Uw3YZqrGKQsIGASnITBsoNwRetIBAa9KIcRpUEyInC8KtdFrf7q7jdnwBWUDggSgEAANALAJ0BKjAARAA+7WSpTamlpCIxEg2xMB2JYwDAl+3lqAIxlRVhpu9T3Mb/xoIrpSiRO4SbFTmjBdyVoS5e1nqUlMVwqVNJMG3KhZ7elIVe7QWLKlVwqnbzfBpJCbK7P+QYf80BdyAA/E9KrdUOpTbrPI36aY6EMaNJaneEYJ69GaEzZSnTwy/5KQfrbWTJuQ0PvQ127aTRfpyNDwonbcPtTBaCWqP3zCitykJjOwZj999rs5r1bN58ctuJ2A0fPMwtMq0P34SMihCrnBTuS6IIshXn2F5mN56nrQac+JhLziQVJ7u9c2i2x1uHJE94qvrtAy73KXMwQUUaCeRcdUZGQyoG96S92+KABQj2P3GahFLs4XqEOb62nyiwgQW+3B+GX85Ou9WKujPVoob8O0ncJfUEPieY4kND283mUocWdKnWAYmiq70wAA=="
  },
  "/uploads/astera-upload-1780249727880-fghflgahufr.webp": {
    "webp": "/optimized/uploads/astera-upload-1780249727880-fghflgahufr.webp",
    "fallback": "/optimized/uploads/astera-upload-1780249727880-fghflgahufr.webp",
    "webpSrcSet": "/optimized/uploads/astera-upload-1780249727880-fghflgahufr-331w.webp 331w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-480w.webp 480w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-662w.webp 662w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-828w.webp 828w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-1200w.webp 1200w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1780249727880-fghflgahufr-331w.webp 331w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-480w.webp 480w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-662w.webp 662w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-828w.webp 828w, /optimized/uploads/astera-upload-1780249727880-fghflgahufr-1200w.webp 1200w",
    "width": 1199,
    "height": 697,
    "lqip": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAADwBQCdASowABwAPt1cpE2opSOiNUgBEBuJQAAoEgFzFX+bR+agl/f7SCJ7fQdDt/8KK+HD3jcoAAD+/NWTZk3fy4BkFwOjBkH+naXaaUMtOjXevp+WZjR5DYVVIl5sYNxVLQWtsij7LDYYri923JkqA78uaayLBZPoh3aoTE1F+79qI42HoVptAV4aWLLuycT+gKKz/u+eIOQA"
  },
  "/uploads/astera-upload-1780249734951-o1u9hv3n2z.webp": {
    "webp": "/optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z.webp",
    "fallback": "/optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z.webp",
    "webpSrcSet": "/optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-331w.webp 331w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-480w.webp 480w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-662w.webp 662w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-828w.webp 828w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-1200w.webp 1200w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-331w.webp 331w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-480w.webp 480w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-662w.webp 662w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-828w.webp 828w, /optimized/uploads/astera-upload-1780249734951-o1u9hv3n2z-1200w.webp 1200w",
    "width": 1200,
    "height": 755,
    "lqip": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAAAQBwCdASowAB4APu1orVAppaQipWzJMB2JQBOmd8gZ19LJjiU11OwDWsqMg1A5vPnhWHB5A4+oG9qPj3TcG6amAAD+2V8ocZUJODzllNB3JeQA+pqJCTVOlHWHr9mCE5KchhxEBPswl9CIpupLwIqW1dYQNQk3RQm6ICD7CNXCTo2mvYitssETq1xWGWbAYOjEs4yX8NIyvYirimYY03idGmGeTE5KxPPnL03B6RrxZcdeMnab0DA9KNDZGhXtY8xhBdo6vVP6EFkZcAAAAA=="
  },
  "/uploads/astera-upload-1780250440546-7dk616iblby.webp": {
    "webp": "/optimized/uploads/astera-upload-1780250440546-7dk616iblby.webp",
    "fallback": "/optimized/uploads/astera-upload-1780250440546-7dk616iblby.webp",
    "webpSrcSet": "/optimized/uploads/astera-upload-1780250440546-7dk616iblby-331w.webp 331w, /optimized/uploads/astera-upload-1780250440546-7dk616iblby-480w.webp 480w",
    "fallbackSrcSet": "/optimized/uploads/astera-upload-1780250440546-7dk616iblby-331w.webp 331w, /optimized/uploads/astera-upload-1780250440546-7dk616iblby-480w.webp 480w",
    "width": 480,
    "height": 676,
    "lqip": "data:image/webp;base64,UklGRv4CAABXRUJQVlA4WAoAAAAQAAAALwAAQwAAQUxQSFYBAAANmQ8QRPQ/BI1cB5QUyUEzRRwx8///BTt0ajlmZujc0it1Ok81kaUu1aatSk/qMnsVMQETsBKfuC622mLDNhF45omnptamadkQscg6R+ALrom0lx574J67rrvl330PvbbVPkecdtk1Fxx31H47xCsviH7WKsYGgzz3GhgIOnT03jHvBNaADnH/DAtSRu/Dfu2ySANU+vRME0PWmuEu+kkkDNpbz0UQH1SV1qbWwahzNSjcPwE0lyaZhk93bcsxhBFzUB0fdQDqKkl8QYXqUIbRAPBD7oQEiS/tKmDAyfdcHXSS+IoOBZwOGuGisFB8ZYdTFBaEKiLEvxZAuAjMoiMyFQWQYwhqqNUcXgBoGF2tImdxlGGjDdSYs6NMBkaTmlW1EESMPmrkhFItdUjCpRgkgNRNL8cszPU7ymWmDd8sCFm59F6UeXMtKYglijbXURbgUprim/dWUDggggEAANALAJ0BKjAARAA+7WCqTimlJCIu9J35MB2JQBZJhVgBYlQGxwiAf7bd0tXaeOKYtQSn+4AakfTiZwR67Z+7isZl4C5qcOo1gRPGYdR7AYql3SEIqKnvSzMPDcDxX9KSOXrrTXMN45wA+ejcq+D3NRnNuhrT0NOZbeOMNDeoD5AmGGBtRmrJQY9x/JVw0pRRuFTG8dA+8bNHxi5KFnoi949EXswp2Dk7rj0+qpChTi3wjsacETxbl+GsOIsjXvR/xRkcaKkEIxuBc0AkDHen/qIwTsXhjXNPgZLXAfOZDY3ufUGK7fKrE1kzfCoThsBOxBG5T/3MaX1DCXkWdbVIp+EYOOxGAtM+CtqBn9mc4TCxcb70W0WWQ8D158jXrdEOz9r2pH91xfBnxfix3glIFcb2gNIvrd00anRifYrTD2AmO7IIeiLCw1aLx0nSDqq7NCB3CSqDvVjrW3Uvdh6SU8u7f3zsewq+ih1A/d65sMl6+VTYJUG6hm73oi9I/qJ/f4AA"
  },
  "/uploads/upload-1775752711594-ra6msm8ooeq.jpg": {
    "webp": "/optimized/uploads/upload-1775752711594-ra6msm8ooeq.webp",
    "fallback": "/optimized/uploads/upload-1775752711594-ra6msm8ooeq.jpg",
    "webpSrcSet": "/optimized/uploads/upload-1775752711594-ra6msm8ooeq-331w.webp 331w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-480w.webp 480w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-662w.webp 662w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-828w.webp 828w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-1024w.webp 1024w",
    "fallbackSrcSet": "/optimized/uploads/upload-1775752711594-ra6msm8ooeq-331w.jpg 331w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-480w.jpg 480w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-662w.jpg 662w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-828w.jpg 828w, /optimized/uploads/upload-1775752711594-ra6msm8ooeq-1024w.jpg 1024w",
    "width": 1024,
    "height": 1024,
    "lqip": "data:image/webp;base64,UklGRvIAAABXRUJQVlA4IOYAAADQCACdASowADAAPu1gqk+ppSOiKrqsATAdiWQAsR/DCz74dIrU5zs72poApAd/TYL6Y5iWByOHaVMKSqQR3wY+KZEkjk6WJBJmG28v+8OAAP7D/bK9AV0kUtdqxYM7BYIwZ3dkOlhEPcnCaeox1CZDjXQdFLrKvetpZQnL3BNbbzjH8VHjJKOjxzyiOPa0AclU0JXlu9UsdeOrbKEgjNBViKKO+Ez6iDSGSzyRmNgvfY2JrHA2uqlqIgmfmVMIZUHDXt1V8eV/ctBnnFe2PHPXq+fnneaPshEPFrE1ZVfRSOjZyFYAAA=="
  },
  "/uploads/upload-1775752788611-901i5x6w5yj.jpeg": {
    "webp": "/optimized/uploads/upload-1775752788611-901i5x6w5yj.webp",
    "fallback": "/optimized/uploads/upload-1775752788611-901i5x6w5yj.jpg",
    "webpSrcSet": "/optimized/uploads/upload-1775752788611-901i5x6w5yj-331w.webp 331w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-480w.webp 480w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-662w.webp 662w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-828w.webp 828w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-1024w.webp 1024w",
    "fallbackSrcSet": "/optimized/uploads/upload-1775752788611-901i5x6w5yj-331w.jpg 331w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-480w.jpg 480w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-662w.jpg 662w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-828w.jpg 828w, /optimized/uploads/upload-1775752788611-901i5x6w5yj-1024w.jpg 1024w",
    "width": 1024,
    "height": 768,
    "lqip": "data:image/webp;base64,UklGRhwBAABXRUJQVlA4IBABAADwCACdASowACQAPu1srFEppiQipzgMkTAdiWIAnTlBUxVfY3/zXpkm9SSE7UxBbE6uSfO3UROSGBJJZHDUiw6C3mHThxI0Jif3uuiMsn8NgADLJlDKqqxEZFAwNRkz7HN8K9Smux8Hm662Lzq0cgGY+ccMutNr8wRPolyZjsbGtvOKu7rbBHmmKMBf5me2xEScjOgGFvn0wW+KcI2jdxTAAYz/R+779WKtDRHcDdKlyc91tcq8DlYVfq27+9rWgnQkp1VegeXJNEBi6lGBz/LaK2nguF7eZRnQUczIU3NMJI51kjOJhwkolon/utZmf+AVqGQTXHfKYHcAbHaTQJolxDW7Qodxo+qwfdPP+PxAAA=="
  },
  "/uploads/upload-1775753476085-fruc5wlvfm9.jpg": {
    "webp": "/optimized/uploads/upload-1775753476085-fruc5wlvfm9.webp",
    "fallback": "/optimized/uploads/upload-1775753476085-fruc5wlvfm9.jpg",
    "webpSrcSet": "/optimized/uploads/upload-1775753476085-fruc5wlvfm9-331w.webp 331w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-480w.webp 480w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-662w.webp 662w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-828w.webp 828w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-1024w.webp 1024w",
    "fallbackSrcSet": "/optimized/uploads/upload-1775753476085-fruc5wlvfm9-331w.jpg 331w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-480w.jpg 480w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-662w.jpg 662w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-828w.jpg 828w, /optimized/uploads/upload-1775753476085-fruc5wlvfm9-1024w.jpg 1024w",
    "width": 1024,
    "height": 1024,
    "lqip": "data:image/webp;base64,UklGRvIAAABXRUJQVlA4IOYAAADQCACdASowADAAPu1gqk+ppSOiKrqsATAdiWQAsR/DCz74dIrU5zs72poApAd/TYL6Y5iWByOHaVMKSqQR3wY+KZEkjk6WJBJmG28v+8OAAP7D/bK9AV0kUtdqxYM7BYIwZ3dkOlhEPcnCaeox1CZDjXQdFLrKvetpZQnL3BNbbzjH8VHjJKOjxzyiOPa0AclU0JXlu9UsdeOrbKEgjNBViKKO+Ez6iDSGSzyRmNgvfY2JrHA2uqlqIgmfmVMIZUHDXt1V8eV/ctBnnFe2PHPXq+fnneaPshEPFrE1ZVfRSOjZyFYAAA=="
  },
  "/uploads/upload-1775757477245-hdx55ha529s.jpg": {
    "webp": "/optimized/uploads/upload-1775757477245-hdx55ha529s.webp",
    "fallback": "/optimized/uploads/upload-1775757477245-hdx55ha529s.jpg",
    "webpSrcSet": "/optimized/uploads/upload-1775757477245-hdx55ha529s-331w.webp 331w, /optimized/uploads/upload-1775757477245-hdx55ha529s-480w.webp 480w, /optimized/uploads/upload-1775757477245-hdx55ha529s-662w.webp 662w, /optimized/uploads/upload-1775757477245-hdx55ha529s-828w.webp 828w, /optimized/uploads/upload-1775757477245-hdx55ha529s-1024w.webp 1024w",
    "fallbackSrcSet": "/optimized/uploads/upload-1775757477245-hdx55ha529s-331w.jpg 331w, /optimized/uploads/upload-1775757477245-hdx55ha529s-480w.jpg 480w, /optimized/uploads/upload-1775757477245-hdx55ha529s-662w.jpg 662w, /optimized/uploads/upload-1775757477245-hdx55ha529s-828w.jpg 828w, /optimized/uploads/upload-1775757477245-hdx55ha529s-1024w.jpg 1024w",
    "width": 1024,
    "height": 1024,
    "lqip": "data:image/webp;base64,UklGRvIAAABXRUJQVlA4IOYAAADQCACdASowADAAPu1gqk+ppSOiKrqsATAdiWQAsR/DCz74dIrU5zs72poApAd/TYL6Y5iWByOHaVMKSqQR3wY+KZEkjk6WJBJmG28v+8OAAP7D/bK9AV0kUtdqxYM7BYIwZ3dkOlhEPcnCaeox1CZDjXQdFLrKvetpZQnL3BNbbzjH8VHjJKOjxzyiOPa0AclU0JXlu9UsdeOrbKEgjNBViKKO+Ez6iDSGSzyRmNgvfY2JrHA2uqlqIgmfmVMIZUHDXt1V8eV/ctBnnFe2PHPXq+fnneaPshEPFrE1ZVfRSOjZyFYAAA=="
  }
};
