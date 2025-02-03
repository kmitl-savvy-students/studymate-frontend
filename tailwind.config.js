import { amber as _amber, blue as _blue, emerald as _emerald, indigo as _indigo, lime as _lime, orange as _orange, red as _red, teal as _teal, violet as _violet } from 'tailwindcss/colors';
import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme';

export const content = ['./src/**/*.{html,ts}', './node_modules/flowbite/**/*.js'];
export const plugins = [require('flowbite/plugin')];
export const theme = {
	extend: {
		fontFamily: {
			sans: ['IBM Plex Sans Thai', ..._fontFamily.sans],
		},
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
		white: '#ffffff',
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
	container: {
		padding: {
			'DEFAULT': '1rem',
			'sm': '2rem',
			'md': '3rem',
			'lg': '4rem',
			'xl': '5rem',
			'2xl': '6rem',
		},
	},
};
