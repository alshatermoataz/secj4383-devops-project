"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  Badge,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { FaShoppingCart, FaHome, FaBox } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Navigation() {
  const { state } = useCart();

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" py={4}>
          {/* Logo */}
          <Link href="/">
            <Heading
              size="lg"
              color="white"
              cursor="pointer"
              _hover={{ color: "whiteAlpha.800" }}
              transition="color 0.2s"
            >
              ShopLux
            </Heading>
          </Link>

          {/* Navigation Links */}
          <HStack spacing={6}>
            <Link href="/">
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FaHome />}
              >
                Home
              </Button>
            </Link>

            <Link href="/products">
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FaBox />}
              >
                Products
              </Button>
            </Link>

            {/* Cart Button with Counter */}
            <Link href="/cart">
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FaShoppingCart />}
                position="relative"
              >
                Cart
                {state.itemCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </HStack>

          {/* Cart Summary */}
          <HStack spacing={2} color="white" fontSize="sm">
            <Text>Total: ${state.total.toFixed(2)}</Text>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
