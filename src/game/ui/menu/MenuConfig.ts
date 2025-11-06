/**
 * Menu configuration - Mirrors archive/src/common/menu/menu-config.js
 * Defines color schemes for menu theming
 */
export const MENU_COLOR = Object.freeze({
  1: {
    main: 0x32454c,
    border: 0x6d9aa8,
  },
  2: {
    main: 0x324c3a,
    border: 0x6da87d,
  },
  3: {
    main: 0x38324c,
    border: 0x796da8,
  },
} as const);

export type MenuColorScheme = typeof MENU_COLOR[keyof typeof MENU_COLOR];