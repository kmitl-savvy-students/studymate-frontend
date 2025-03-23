import { amber as _amber, blue as _blue, emerald as _emerald, indigo as _indigo, lime as _lime, orange as _orange, red as _red, teal as _teal, violet as _violet } from 'tailwindcss/colors';
import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme';

export const content = ['./src/**/*.{html,ts}', './node_modules/flowbite/**/*.js'];
export const plugins = [require('flowbite/plugin')];
export const theme = {
	extend: {
		fontFamily: {
			sans: ['IBM Plex Sans Thai', ..._fontFamily.sans],
		},
		screens: {
			'3xl': '1600px',
		},
		colors: {
			violet: _violet,
			indigo: _indigo,
			blue: _blue,
			emerald: _emerald,
			amber: _amber,
			orange: _orange,
			teal: _teal,
			red: _red,
			lime: _lime,

			light: '#FFFFFF',
			// dark: '#0E182F',

			primary: {
				500: '#0E182F',
				400: '#385594',
				300: '#4D74CB',
				200: '#D2DCF2',
				100: '#E4EAF7',
			},
			secondary: {
				300: '#262845',
				200: '#5C5E73',
				100: '#9293A2',
			},
			warning: {
				500: '#7A4B16',
				400: '#A0651F',
				300: '#D18A2E',
				200: '#EBCB9B',
				100: '#F4E3C8',
			},
			success: {
				500: '#1C3A22',
				400: '#2E5A35',
				300: '#4C8D55',
				200: '#A6C9A8',
				100: '#D2E5D4',
			},
			info: {
				500: '#0B2546',
				400: '#16467C',
				300: '#2F74C2',
				200: '#A7C6EB',
				100: '#D3E2F6',
			},
			danger: {
				500: '#5C1B1B',
				400: '#892424',
				300: '#C03636',
				200: '#E3A3A3',
				100: '#F2D6D6',
			},
			main: {
				120: '#4263AC',
				100: '#4D74CB',
				75: '#4D74CBBF',
				50: '#4D74CB80',
				25: '#4D74CB40',
				15: '#4D74CB26',
				10: '#4D74CB1A',
				5: '#4D74CB0D',
			},
			dark: {
				100: '#262845',
				75: '#262845BF',
				50: '#26284580',
				10: '#2628451A',
			},
		},
	},
	container: {
		center: true,
		padding: {
			'DEFAULT': '1rem',
			'sm': '2rem',
			'md': '3rem',
			'lg': '4rem',
			'xl': '5rem',
			'2xl': '6rem',
		},
	},
	// container: {
	// 	center: false, // ปิดการจัดกึ่งกลางเพื่อไม่ให้มี margin อัตโนมัติ
	// 	screens: {
	// 		'2xl': '100%', // ทำให้ container กว้างเต็มจอในหน้าจอใหญ่
	// 	},
	// 	padding: {
	// 		'DEFAULT': '16px', // 16px
	// 		'sm': '32px', // 32px
	// 		'md': '48px', // 48px
	// 		'lg': '64px', // 64px
	// 		'xl': '80px', // 80px
	// 		'2xl': '96px', // 96px
	// 	},
	// },
};
