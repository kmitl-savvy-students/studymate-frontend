const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
	content: ['./src/**/*.{html,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['IBM Plex Sans Thai', ...defaultTheme.fontFamily.sans],
			},
		},
		colors: {
			'violet': colors.violet,
			'indigo': colors.indigo,
			'blue': colors.blue,
			'emerald': colors.emerald,
			'amber': colors.amber,
			'orange': colors.orange,
			'teal': colors.teal,
			'red': colors.red,
			'white': '#ffffff',
			'main': {
				100: '#4D74CB',
				75: '#4D74CBBF',
				50: '#4D74CB80',
				25: '#4D74CB40',
				15: '#4D74CB26',
				10: '#4D74CB1A',
				5: '#4D74CB0D',
			},
			'dark': {
				100: '#262845',
				75: '#262845BF',
				50: '#26284580',
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
	},
};
