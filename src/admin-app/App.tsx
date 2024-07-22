import React from "react";
import "./app.css";
import { TextField, ThemeProvider } from "@mui/material";
import { themeWithMode } from "shared-code";

const App = () => {
  const theme = themeWithMode("light");
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
        <p>Admin App</p>
        <TextField label="First Name" required sx={{ mr: 2, mb: 5 }} />
        <TextField label="Middle Name" sx={{ mr: 2, mb: 5 }} />
        <TextField label="Last Name" required />
      </div>
      ;
    </ThemeProvider>
  );
};

export default App;
