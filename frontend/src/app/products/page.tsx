"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Button,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axios from "axios";

// Add color palette from main page
const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/products/featured"
        );

        console.log("response: ", response);
        setProducts(response.data);
      } catch (error) {
        toast({
          title: "Error fetching products",
          description: "Please try again later",
          status: "error",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        position="relative"
        bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
        overflow="hidden"
      >
        {/* Decorative blurred blob */}
        <Box
          position="absolute"
          top="-100px"
          right="-100px"
          w="350px"
          h="350px"
          bgGradient={`radial(${palette.pink}, ${palette.purple}, transparent)`}
          filter="blur(80px)"
          zIndex={0}
        />
        <Center h="100vh" position="relative" zIndex={1}>
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      position="relative"
      bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
      overflow="hidden"
    >
      {/* Decorative blurred blob */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="350px"
        h="350px"
        bgGradient={`radial(${palette.pink}, ${palette.purple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
      />
      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        <Heading mb={8} color="white" textShadow="0 2px 16px #b388eb">
          Our Products
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {products.map((product) => (
            <Box
              key={product.id}
              borderWidth="2px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              shadow="lg"
              borderColor={palette.pink}
              bg="whiteAlpha.900"
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
                borderRadius="md"
              />
              <Box mt={4}>
                <Heading size="md" color={palette.purple}>
                  {product.name}
                </Heading>
                <Text mt={2} color="gray.600">
                  {product.description}
                </Text>
                <Text
                  mt={2}
                  fontWeight="bold"
                  fontSize="xl"
                  color={palette.deepPurple}
                >
                  ${product.price.toFixed(2)}
                </Text>
                <Button
                  mt={4}
                  bg={palette.purple}
                  color="white"
                  _hover={{ bg: palette.deepPurple }}
                  width="100%"
                  onClick={() => {
                    // TODO: Implement add to cart functionality
                    toast({
                      title: "Added to cart",
                      description: `${product.name} has been added to your cart`,
                      status: "success",
                      duration: 3000,
                    });
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
