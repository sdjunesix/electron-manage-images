module.exports = {
    content: [
      "./index.html", 
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          muted_foreground: '#727272',
        },
        borderColor: {
          line: '#E5E5E5',
        },
        backgroundColor: {
          muted: '#F5F5F5',
          muted_50: '#F5F5F580',
          accent: '#9785eb',
          accent_50: '#9785eb80',
        },
      },
    },
    plugins: [],
};