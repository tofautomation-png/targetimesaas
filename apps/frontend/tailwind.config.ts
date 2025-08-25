import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#04110B',
          secondary: '#0A1C14',
        },
        neon: {
          primary: '#00FF85',
          secondary: '#00FFC5',
          accent: '#4EF0A8',
        },
        text: {
          primary: '#F2F7F5',
          secondary: '#A9B8B3',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #00FF85 0%, #00FFC5 100%)',
        'dark-gradient': 'linear-gradient(135deg, #04110B 0%, #0A1C14 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(78, 240, 168, 0.3)',
        'neon-lg': '0 0 40px rgba(78, 240, 168, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'flip-in': 'flipIn 0.6s ease-out',
        'flip-out': 'flipOut 0.6s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(78, 240, 168, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(78, 240, 168, 0.6)' },
        },
        flipIn: {
          '0%': { transform: 'perspective(1000px) rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'perspective(1000px) rotateY(0deg)', opacity: '1' },
        },
        flipOut: {
          '0%': { transform: 'perspective(1000px) rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'perspective(1000px) rotateY(90deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
