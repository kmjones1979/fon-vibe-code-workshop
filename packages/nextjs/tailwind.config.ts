const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import(\'tailwindcss\').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark", // Default SE-2 dark theme
  // DaisyUI config (can be theme-specific)
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#0070F3", // Example: Vercel blue
          secondary: "#F59E0B", // Example: Amber
          accent: "#10B981", // Example: Emerald
          "base-100": "#F9FAFB", // Lighter background
          "--rounded-btn": "0.5rem",
          ".btn": {
            "text-transform": "none", // Keep button text case as is
          },
        },
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#2563EB",
          secondary: "#D97706",
          accent: "#059669",
          "base-100": "#1F2937",
          "--rounded-btn": "0.5rem",
          ".btn": {
            "text-transform": "none",
          },
        },
      },
      {
        // Hypothetical "emojiQuestLike" theme
        emojiQuestLike: {
          primary: "hsl(210, 90%, 55%)", // Friendly Blue
          "primary-content": "hsl(0, 0%, 100%)", // White text on primary
          secondary: "hsl(175, 70%, 45%)", // Complementary Teal/Aqua
          "secondary-content": "hsl(0, 0%, 100%)", // White text on secondary
          accent: "hsl(45, 100%, 60%)", // Warm Yellow
          "accent-content": "hsl(45, 100%, 15%)", // Dark text on accent
          neutral: "hsl(220, 10%, 50%)", // Soft Gray
          "neutral-content": "hsl(0, 0%, 100%)",
          "base-100": "hsl(220, 20%, 97%)", // Very Light Gray background
          "base-200": "hsl(220, 20%, 90%)",
          "base-300": "hsl(220, 15%, 85%)",
          "base-content": "hsl(220, 10%, 20%)", // Darker text for content
          info: "hsl(200, 80%, 60%)",
          success: "hsl(150, 70%, 40%)",
          warning: "hsl(50, 90%, 55%)",
          error: "hsl(0, 80%, 60%)",
          "--rounded-box": "0.8rem", // Consistent, slightly larger rounding for cards/boxes
          "--rounded-btn": "0.6rem", // Button rounding
          "--rounded-badge": "1.9rem", // For badges (usually more rounded)
          "--animation-btn": "0.2s", // Slightly faster button animations
          "--btn-focus-scale": "0.98", // Button focus scale
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.6rem",
          // Custom properties for emoji-quest like input styles (conceptual)
          "--input-border-color": "hsl(220, 15%, 75%)",
          "--input-focus-border-color": "hsl(210, 90%, 65%)",
        },
      },
    ],
    darkTheme: "dark", // Keep dark theme as an option if user prefers
    logs: true,
  },
  theme: {
    extend: {
      boxShadow: {
        "custom-light": "0 2px 12px -3px rgba(0, 0, 0, 0.1), 0 2px 8px -4px rgba(0, 0, 0, 0.06)",
        "custom-dark": "0 2px 12px -3px rgba(0, 0, 0, 0.4), 0 2px 8px -4px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
        // Add a playful font if you have one for emoji-quest, e.g.:
        // 'emojiQuestFont': ['Comic Sans MS', 'cursive'], // Example, replace with actual font
      },
    },
  },
};
