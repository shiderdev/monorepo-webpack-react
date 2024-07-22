import React from "react";
import "./app.css";
import { TextField, ThemeProvider } from "@mui/material";
import createCustomTheme from "./theme";
import { ThemeModeEnum } from "shared-code";

const App = () => {
  const theme = createCustomTheme(ThemeModeEnum.light);
  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          margin: "auto",
          width: "400px",
          height: "400px",
          fontSize: "44px",
        }}
      >
        <a href="/admin">Go to Admin Panel</a>
        <p>Client App</p>
        <TextField label="First Name" required sx={{ mr: 2 }} />
        <TextField label="Middle Name" sx={{ mr: 2 }} />
        <TextField label="Last Name" required />
      </div>
    </ThemeProvider>
  );
};

export default App;
