import { createTheme, PaletteMode, Theme } from "@mui/material";
import { ColorEnum, ThemeModeEnum } from "shared-code/enum";

type ThemeWithMode = (mode: PaletteMode) => Theme;
export const themeWithMode: ThemeWithMode = (mode) => {
  if (!(mode === ThemeModeEnum.light || mode === ThemeModeEnum.dark)) {
    mode = ThemeModeEnum.light;
  }
  return createTheme(
    {
      palette: {
        mode,
        primary: {
          main: ColorEnum.purple,
        },
      },
    },
    {
      components: {
        MuiTextField: {
          defaultProps: { variant: "filled" },
        },
      },
    }
  );
};
