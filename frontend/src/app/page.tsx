"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaCalendarAlt,
  FaStore,
} from "react-icons/fa";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Home() {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Secure Shopping",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: FaCalendarAlt,
      title: "Easy Pickup Scheduling",
      description:
        "Schedule convenient pickup times that work for your schedule",
    },
    {
      icon: FaStore,
      title: "Quality Products",
      description: "Curated selection of premium products for your lifestyle",
    },
  ];

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

      {/* Hero Section */}
      <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
        <VStack spacing={8} textAlign="center">
          <Heading
            size="4xl"
            color="white"
            fontWeight="bold"
            textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            lineHeight="shorter"
          >
            Welcome to{" "}
            <Text
              as="span"
              bgGradient="linear(to-r, white, purple.100)"
              bgClip="text"
            >
              ShopLux
            </Text>
          </Heading>

          <Text
            fontSize="2xl"
            color="whiteAlpha.900"
            maxW="3xl"
            mx="auto"
            textShadow="1px 1px 2px rgba(0,0,0,0.2)"
          >
            Discover amazing products at unbeatable prices. Your premium
            shopping destination for quality and style.
          </Text>

          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Link href="/products" passHref>
              <Button
                size="lg"
                bg="white"
                color={palette.purple}
                _hover={{ bg: "whiteAlpha.90", transform: "translateY(-2px)" }}
                rightIcon={<FaArrowRight />}
                px={8}
                py={6}
                fontSize="lg"
                shadow="xl"
                transition="all 0.3s"
              >
                Shop Now
              </Button>
            </Link>
            <Link href="/register" passHref>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: "whiteAlpha.20", transform: "translateY(-2px)" }}
                px={8}
                py={6}
                fontSize="lg"
                transition="all 0.3s"
              >
                Join Today
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={16} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {features.map((feature, index) => (
            <Box
              key={index}
              p={8}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              textAlign="center"
              borderWidth="2px"
              borderColor="whiteAlpha.300"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
            >
              <VStack spacing={4}>
                <Box
                  w={16}
                  h={16}
                  bgGradient={`linear(to-r, ${palette.purple}, ${palette.deepPurple})`}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={feature.icon} boxSize={8} color="white" />
                </Box>
                <Heading size="md" color="gray.800">
                  {feature.title}
                </Heading>
                <Text color="gray.600" textAlign="center">
                  {feature.description}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Container maxW="container.xl" py={16} position="relative" zIndex={1}>
        <Box
          p={12}
          bg="whiteAlpha.900"
          borderRadius="xl"
          shadow="2xl"
          textAlign="center"
          borderWidth="2px"
          borderColor="whiteAlpha.300"
        >
          <VStack spacing={6}>
            <Flex justify="center" mb={4}>
              {[...Array(5)].map((_, i) => (
                <Icon key={i} as={FaStar} boxSize={8} color="yellow.400" />
              ))}
            </Flex>
            <Heading size="2xl" color="gray.800">
              Join thousands of happy customers
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Experience premium shopping with our curated collection of
              products, backed by excellent customer service.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Link href="/products" passHref>
                <Button
                  size="lg"
                  bgGradient={`linear(to-r, ${palette.purple}, ${palette.deepPurple})`}
                  color="white"
                  _hover={{
                    bgGradient: `linear(to-r, ${palette.deepPurple}, ${palette.purple})`,
                    transform: "translateY(-2px)",
                  }}
                  px={8}
                  py={6}
                  fontSize="lg"
                  shadow="xl"
                  transition="all 0.3s"
                >
                  Browse Products
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  px={8}
                  py={6}
                  fontSize="lg"
                  transition="all 0.3s"
                >
                  Sign In
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
