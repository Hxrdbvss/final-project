// uno.config.js
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Основной пресет, который включает Tailwind-совместимые утилиты
  ],
  content: {
    pipeline: {
      include: [
        /\.(jsx|tsx|html)($|\?)/, // Сканировать JSX/TSX/HTML файлы
      ],
    },
  },
})