import { createTheme, PaletteMode } from "@mui/material";
import { themeWithMode } from "shared-code";

const createCustomTheme = (mode: PaletteMode) =>
  createTheme(themeWithMode(mode), {
    components: {
      MuiTextField: {
        defaultProps: { variant: "outlined" },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: { borderRadius: 0, marginBottom: "20px" },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: "36px",
          },
        },
      },
    },
  });

export default createCustomTheme;
