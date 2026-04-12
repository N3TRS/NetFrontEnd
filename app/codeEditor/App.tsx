"use client";

import { Box } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";

const App = () => {
  return (
    <Box minH="100vh" bg="#1a0b2e" color="white" px={6} py={8}>
      <CodeEditor />
    </Box>
  );
}
export default App;
