"use client";

import { Box, Text, Flex } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS, LANGUAGE_COLORS } from "../Utils/constants";

const LanguageSelector = ({ language }) => {
    return (
        <Box ml={2} mb={4}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Programming language:
            </Text>
            <Flex align="center" gap={2}>
                <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={LANGUAGE_COLORS[language]}
                />
                <Text>
                    {language.charAt(0).toUpperCase() + language.slice(1)} ({LANGUAGE_VERSIONS[language]})
                </Text>
            </Flex>
        </Box>
    );
};
export default LanguageSelector;
