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
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={8}>Our Products</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {products.map((product) => (
          <Box
            key={product.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
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
              <Heading size="md">{product.name}</Heading>
              <Text mt={2} color="gray.600">
                {product.description}
              </Text>
              <Text mt={2} fontWeight="bold" fontSize="xl">
                ${product.price.toFixed(2)}
              </Text>
              <Button
                mt={4}
                colorScheme="blue"
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
  );
}
