export default function manifest() {
  return {
    name: "jac.ob — Jacob Ince",
    short_name: "jac.ob",
    description:
      "Portfolio of Jacob Ince, a London-based creative developer building interactive websites and digital experiences for brands, agencies and ambitious businesses",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#10F200",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
