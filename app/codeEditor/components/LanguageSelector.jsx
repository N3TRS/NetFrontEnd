"use client";

import { Box, Text, Flex } from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS, LANGUAGE_COLORS } from "../Utils/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }) => {
    return (
        <Box ml={2} mb={4}>  
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Programming language:
            </Text>
            <MenuRoot isLazy>
                <MenuTrigger asChild>
                    <Button variant="outline" size="md">
                        <Flex align="center" gap={2}>
                            <Box 
                                w="12px" 
                                h="12px" 
                                borderRadius="full" 
                                bg={LANGUAGE_COLORS[language]}
                            />
                            {language 
                                ? `${language.charAt(0).toUpperCase() + language.slice(1)} (${LANGUAGE_VERSIONS[language]})`
                                : "Choose Language"
                            }
                        </Flex>
                    </Button>
                </MenuTrigger>
                <MenuContent>
                    {languages.map(([lang, version]) => (
                        <MenuItem 
                            key={lang}
                            value={lang}
                            onClick={() => onSelect(lang)}
                        >
                            <Flex align="center" gap={2}>
                                <Box 
                                    w="12px" 
                                    h="12px" 
                                    borderRadius="full" 
                                    bg={LANGUAGE_COLORS[lang]}
                                />
                                {lang.charAt(0).toUpperCase() + lang.slice(1)} ({version})
                            </Flex>
                        </MenuItem>
                    ))} 
                </MenuContent>
            </MenuRoot>
        </Box>
    )
}
export default LanguageSelector;
