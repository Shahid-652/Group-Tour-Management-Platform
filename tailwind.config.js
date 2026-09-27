/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        /* ================================
           WAYFARE TRAVEL PALETTE
        ================================= */

        /* Deep navy - headings, navbar, dark elements */
        night: {
          DEFAULT: "#17324D",
          light: "#29465F",
          lighter: "#3D5A70",
        },

        /* Terracotta - main CTA */
        coral: {
          DEFAULT: "#E9683D",
          dark: "#D95732",
        },

        /* Forest green - travel / positive accent */
        lagoon: {
          DEFAULT: "#526A3F",
          dark: "#435833",
        },

        /* Warm cream */
        sand: "#F3EFE4",

        /* Mustard gold */
        gold: "#D6A63D",

        /* Extra travel colors */
        "warm-bg": "#F3EFE4",
        "cream-card": "#F5E7B9",
        "warm-khaki": "#E5D3A0",
        "muted-teal": "#3D9B91",
        "charcoal": "#263746",
        "warm-gray": "#6F756F",
      },

      fontFamily: {
        display: [
          "'Fraunces'",
          "serif",
        ],

        body: [
          "'Inter'",
          "sans-serif",
        ],

        mono: [
          "'JetBrains Mono'",
          "monospace",
        ],
      },

      backgroundImage: {
        "route-dots":
          "radial-gradient(circle, rgba(82,106,63,0.10) 1px, transparent 1px)",

        "main-bg": `
          radial-gradient(
            circle at 10% 10%,
            rgba(233, 104, 61, 0.035),
            transparent 28%
          ),
          radial-gradient(
            circle at 90% 85%,
            rgba(82, 106, 63, 0.045),
            transparent 30%
          ),
          linear-gradient(
            135deg,
            #F3EFE4 0%,
            #F8F5ED 50%,
            #F1EDE2 100%
          )
        `,
      },
    },
  },

  plugins: [],
};