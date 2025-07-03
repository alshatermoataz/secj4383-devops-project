"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Image,
  IconButton,
  Badge,
  useToast,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaHeart, FaStar, FaShoppingCart, FaRedo } from "react-icons/fa";
import axios from "axios";
import { useCart } from "@/contexts/CartContext";
import Navigation from "@/components/Navigation";

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
  imageUrl?: string;
  image?: string;
  category?: string;
  stock?: number;
  inStock?: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { state, dispatch } = useCart();
  const toast = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching products from API...");

      const possibleEndpoints = [
        "http://localhost:3001/api/products/featured",
        "http://localhost:3001/api/products",
        "http://localhost:3001/products",
      ];

      let response;
      let lastError;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log(`Success with endpoint: ${endpoint}`, response.data);
          break;
        } catch (err) {
          console.log(`Failed with endpoint: ${endpoint}`, err);
          lastError = err;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error("All API endpoints failed");
      }

      let productsData = response.data;

      if (productsData.data) {
        productsData = productsData.data;
      }

      if (productsData.products) {
        productsData = productsData.products;
      }

      if (!Array.isArray(productsData)) {
        throw new Error("API response is not an array of products");
      }

      const normalizedProducts = productsData.map((product: any) => ({
        id: product.id || product._id || String(Math.random()),
        name: product.name || product.title || "Unnamed Product",
        description: product.description || "No description available",
        price: Number(product.price) || 0,
        imageUrl:
          product.imageUrl ||
          product.image ||
          "/placeholder.svg?height=250&width=400&text=Product",
        category: product.category,
        stock: product.stock,
        inStock: product.inStock !== false,
      }));

      console.log("Normalized products:", normalizedProducts);
      setProducts(normalizedProducts);

      if (normalizedProducts.length === 0) {
        setError("No products found in the database");
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);

      let errorMessage = "Failed to load products";

      if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Cannot connect to the server. Make sure your backend is running on http://localhost:3001";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage =
          "No response from server. Check your internet connection and server status.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      setError(errorMessage);

      toast({
        title: "Error loading products",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
      toast({
        title: "Removed from favorites",
        status: "info",
        duration: 2000,
      });
    } else {
      newFavorites.add(productId);
      toast({
        title: "Added to favorites",
        status: "success",
        duration: 2000,
      });
    }
    setFavorites(newFavorites);
  };

  const addToCart = (product: Product) => {
    console.log("Adding to cart:", product);

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || "/placeholder.svg",
      },
    });

    toast({
      title: "Added to cart! 🛒",
      description: `${product.name} has been added to your cart`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    console.log("Cart state after adding:", state);
  };

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        position="relative"
        bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
        overflow="hidden"
      >
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
        <Center h="calc(100vh - 80px)" position="relative" zIndex={1}>
          <VStack spacing={4}>
            <Spinner size="xl" color="white" thickness="4px" />
            <Text color="white" fontSize="lg">
              Loading products from database...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="100vh"
        position="relative"
        bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
        overflow="hidden"
      >
        <Container maxW="container.md" py={10} position="relative" zIndex={1}>
          <Center>
            <Box
              p={8}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              borderWidth="2px"
              borderColor="whiteAlpha.300"
              maxW="md"
            >
              <Alert status="error" borderRadius="lg" mb={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Connection Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Box>
              </Alert>
              <VStack spacing={4}>
                <Text textAlign="center" color="gray.600">
                  Make sure your backend server is running and accessible.
                </Text>
                <Button
                  leftIcon={<FaRedo />}
                  colorScheme="blue"
                  onClick={fetchProducts}
                >
                  Retry
                </Button>
              </VStack>
            </Box>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      position="relative"
      bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
      overflow="hidden"
      pt="80px"
    >
      {/* Decorative blobs */}
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
      <Box
        position="absolute"
        bottom="-100px"
        left="-100px"
        w="350px"
        h="350px"
        bgGradient={`radial(${palette.lightPurple}, ${palette.deepPurple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
      />

      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        {/* Header */}
        <VStack spacing={6} textAlign="center" mb={12}>
          <Heading
            as="h1"
            size="2xl"
            color="white"
            textShadow="0 2px 16px #b388eb"
          >
            Our Products
          </Heading>
          <Text fontSize="xl" color="whiteAlpha.900" maxW="2xl">
            Discover our curated collection of premium products designed to
            elevate your lifestyle
          </Text>

          {/* Products Count */}
          <Text color="whiteAlpha.800" fontSize="md">
            Showing {products.length} products from our database
          </Text>
        </VStack>

        {/* Products Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {products.map((product) => (
            <Box
              key={product.id}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
              borderWidth="2px"
              borderColor="whiteAlpha.300"
            >
              <Box position="relative">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  w="100%"
                  h="250px"
                  objectFit="cover"
                  fallbackSrc="/placeholder.svg?height=250&width=400&text=Product"
                />
                <IconButton
                  aria-label="Add to favorites"
                  icon={<FaHeart />}
                  position="absolute"
                  top={4}
                  right={4}
                  bg="whiteAlpha.800"
                  color={favorites.has(product.id) ? "red.500" : "gray.600"}
                  _hover={{ bg: "white", color: "red.500" }}
                  onClick={() => toggleFavorite(product.id)}
                />
                <HStack
                  position="absolute"
                  bottom={4}
                  left={4}
                  bg="whiteAlpha.900"
                  borderRadius="full"
                  px={3}
                  py={1}
                  spacing={1}
                >
                  <FaStar color="#F6E05E" size={16} />
                  <Text fontSize="sm" fontWeight="medium">
                    4.8
                  </Text>
                </HStack>
              </Box>

              <Box p={6}>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="gray.800" noOfLines={2}>
                    {product.name}
                  </Heading>
                  <Text color="gray.600" noOfLines={3} fontSize="sm">
                    {product.description}
                  </Text>
                  {product.category && (
                    <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                      {product.category}
                    </Badge>
                  )}
                  <HStack justify="space-between" w="100%">
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color={palette.purple}
                    >
                      ${product.price.toFixed(2)}
                    </Text>
                    <Badge
                      colorScheme={product.inStock ? "green" : "red"}
                      variant="subtle"
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                      {product.stock && ` (${product.stock})`}
                    </Badge>
                  </HStack>
                  <HStack spacing={2} w="100%">
                    <Button
                      flex={1}
                      bgGradient={`linear(to-r, ${palette.purple}, ${palette.deepPurple})`}
                      color="white"
                      _hover={{
                        bgGradient: `linear(to-r, ${palette.deepPurple}, ${palette.purple})`,
                        transform: "translateY(-1px)",
                      }}
                      leftIcon={<FaShoppingCart />}
                      onClick={() => addToCart(product)}
                      shadow="lg"
                      transition="all 0.2s"
                      isDisabled={!product.inStock}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <IconButton
                      aria-label="Add to wishlist"
                      icon={<FaHeart />}
                      variant="outline"
                      borderColor={palette.purple}
                      color={
                        favorites.has(product.id) ? "red.500" : palette.purple
                      }
                      _hover={{ bg: "purple.50" }}
                      onClick={() => toggleFavorite(product.id)}
                    />
                  </HStack>
                </VStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {products.length === 0 && !isLoading && !error && (
          <Center py={12}>
            <Box
              p={8}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              textAlign="center"
            >
              <Text color="gray.600" fontSize="lg" mb={4}>
                No products found in the database.
              </Text>
              <Button
                leftIcon={<FaRedo />}
                colorScheme="blue"
                onClick={fetchProducts}
              >
                Refresh
              </Button>
            </Box>
          </Center>
        )}
      </Container>
    </Box>
  );
}
