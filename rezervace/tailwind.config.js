/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F3F0E8',
        cream: '#FBF9F3',
        ink: {
          50: '#F6F5F1',
          100: '#EAE8E1',
          200: '#D5D2C7',
          300: '#ABA79A',
          400: '#7D7A6E',
          500: '#585549',
          600: '#3F3C33',
          700: '#2E2B25',
          800: '#211F1A',
          900: '#171511',
          950: '#0F0E0B',
        },
        accent: {
          50: '#FDF3EC',
          100: '#FAE2D3',
          200: '#F4C2A4',
          300: '#EC9C71',
          400: '#E37544',
          500: '#D9552B',
          600: '#C04520',
          700: '#9C371B',
          800: '#7C2D19',
          900: '#602416',
        },
        sage: {
          50: '#F2F5EC',
          100: '#E2EAD5',
          200: '#C6D6AD',
          300: '#A3BC80',
          400: '#83A25C',
          500: '#66873F',
          600: '#4F6B30',
          700: '#3E5427',
          800: '#324321',
          900: '#28361C',
        },
        // legacy alias — starší komponenty používají primary-*
        primary: {
          50: '#F6F5F1',
          100: '#EAE8E1',
          200: '#D5D2C7',
          300: '#ABA79A',
          400: '#7D7A6E',
          500: '#585549',
          600: '#171511',
          700: '#0F0E0B',
          800: '#0F0E0B',
          900: '#0F0E0B',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 21, 17, 0.04), 0 8px 24px -8px rgba(23, 21, 17, 0.08)',
        lift: '0 2px 4px rgba(23, 21, 17, 0.06), 0 16px 40px -12px rgba(23, 21, 17, 0.18)',
        'ink-glow': '0 8px 32px -8px rgba(23, 21, 17, 0.45)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        marquee: 'marquee 24s linear infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
