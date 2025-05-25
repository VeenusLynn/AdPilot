export const themeSettings = (mode) => {
  // Shared colors between themes
  const sharedColors = {
    object: {
      primary: "#475BE8",
      secondary: "#DADEFA",
      dark: "#1a2991",
    },
    accents: {
      red: "#F45252",
      orange: "#FD8539",
      green: "#2ED480",
      purple: "#6C5DD3",
      pink: "#FE6D8E",
    },
    base: {
      black: "#1A1D1F",
      white: "#FCFCFC",
      gray: "#E4E8EF",
      hover: "#EAEAEA",
    },
  };

  // Theme-specific colors
  const darkColors = {
    text: {
      primary: "#EFEFEF",
      secondary: "#6F767E",
    },
    background: {
      default: "#111315",
      alt: "#1A1D1F",
    },
    divider: "#272B30",
  };

  const lightColors = {
    text: {
      primary: "#11142D",
      secondary: "#808191",
    },
    background: {
      default: "#F4F4F4",
      alt: "#FCFCFC",
    },
    divider: "#E4E4E4",
  };

  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    palette: {
      mode: mode,
      primary: {
        main: sharedColors.object.primary,
        contrastText: colors.text.primary,
      },
      secondary: {
        main: sharedColors.object.secondary,
      },
      error: {
        main: sharedColors.accents.red,
      },
      success: {
        main: sharedColors.accents.green,
      },
      background: {
        default: colors.background.default,
        components: colors.background.alt,
      },
      divider: colors.divider,
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.secondary,
      },
      action: {
        hover: sharedColors.base.hover,
        hoverButton: sharedColors.object.dark,
      },
      common: {
        black: sharedColors.base.black,
        white: sharedColors.base.white,
        red: sharedColors.accents.red,
        green: sharedColors.accents.green,
        purple: sharedColors.accents.purple,
        pink: sharedColors.accents.pink,
        orange: sharedColors.accents.orange,
      },
      grey: {
        500: sharedColors.base.gray,
      },
    },
    typography: {
      fontFamily: "'Manrope', sans-serif",
      fontSize: 12,
      h1: { fontSize: 40 },
      h2: { fontSize: 32 },
      h3: { fontSize: 24 },
      h4: { fontSize: 20 },
      h5: { fontSize: 16 },
      h6: { fontSize: 14 },
    },
  };
};
