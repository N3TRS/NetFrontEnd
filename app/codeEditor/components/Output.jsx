"use client";

import { useState } from "react";
import { Box, Text, Button, Spinner } from "@chakra-ui/react";
import { executeCode } from "../api";

const Output = ({ code, language }) => {
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runCode = async () => {
    if (!code) {
      setError("Please write some code to execute");
      return;
    }

    setIsLoading(true);
    setOutput("");
    setError("");

    try {
      const { run: result } = await executeCode(language, code);

      // Verificar si hay errores en stderr
      if (result.stderr) {
        setError(result.stderr);
      } else {
        setOutput(result.stdout || result.output);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unknown error occurred";
      setError(
        `An error occurred while executing the code.\n\nError: ${message}\n\nMake sure the code is valid for the selected language.`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box w="50%">
      {/* Header con botón Run Code */}
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="lg" fontWeight="bold">
          Output
        </Text>
        <Button
          colorScheme="green"
          onClick={runCode}
          isDisabled={isLoading}
          size="md"
        >
          {isLoading ? <Spinner size="sm" mr={2} /> : null}
          {isLoading ? "Running..." : "Run Code"}
        </Button>
      </Box>

      {/* Output Box */}
      <Box
        p={4}
        bg="#1e1e1e"
        borderRadius="md"
        minHeight="75vh"
        maxHeight="75vh"
        overflowY="auto"
        border="1px solid"
        borderColor="gray.700"
        fontFamily="monospace"
      >
        {error ? (
          <Text color="red.400" whiteSpace="pre-wrap">
            {error}
          </Text>
        ) : output ? (
          <Text color="green.300" whiteSpace="pre-wrap">
            {output}
          </Text>
        ) : (
          <Text color="gray.500">
            Click "Run Code" to see the output here...
          </Text>
        )}
      </Box>
    </Box>
  )
}
export default Output;
