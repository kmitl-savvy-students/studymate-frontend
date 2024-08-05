const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: ['./src/**/*.{html,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['IBM Plex Sans Thai', ...defaultTheme.fontFamily.sans],
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
