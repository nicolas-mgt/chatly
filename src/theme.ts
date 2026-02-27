import {createSystem, defaultConfig, defineConfig} from '@chakra-ui/react'

const config = defineConfig({
	theme: {
		tokens: {
			colors: {
				brand: {
					50: {value: '#ecfdf5'},
					100: {value: '#d1fae5'},
					200: {value: '#a7f3d0'},
					300: {value: '#6ee7b7'},
					400: {value: '#34d399'},
					500: {value: '#10b981'},
					600: {value: '#059669'},
					700: {value: '#047857'},
					800: {value: '#065f46'},
					900: {value: '#064e3b'},
					950: {value: '#022c22'}
				}
			},
			fonts: {
				heading: {value: 'Inter, sans-serif'},
				body: {value: 'Inter, sans-serif'}
			}
		},
		semanticTokens: {
			colors: {
				brand: {
					solid: {value: '{colors.brand.500}'},
					contrast: {value: 'white'},
					fg: {value: '{colors.brand.700}'},
					muted: {value: '{colors.brand.100}'},
					subtle: {value: '{colors.brand.50}'},
					emphasized: {value: '{colors.brand.200}'},
					focusRing: {value: '{colors.brand.500}'}
				}
			}
		}
	}
})

export const system = createSystem(defaultConfig, config)
