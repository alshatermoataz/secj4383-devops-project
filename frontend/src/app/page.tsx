import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Home() {
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
        <Box textAlign="center" mb={10}>
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            color="white"
            textShadow="0 2px 16px #b388eb"
          >
            Welcome to Our E-Commerce Store
          </Heading>
          <Text fontSize="xl" color="whiteAlpha.800">
            Discover amazing products at great prices
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <Box
            p={6}
            shadow="lg"
            borderWidth="2px"
            borderRadius="lg"
            borderColor={palette.pink}
            bg="whiteAlpha.900"
          >
            <Heading as="h3" size="md" mb={4} color={palette.purple}>
              Browse Products
            </Heading>
            <Text mb={4} color="gray.700">
              Explore our wide range of products
            </Text>
            <Link href="/products" passHref>
              <Button
                bg={palette.purple}
                color="white"
                _hover={{ bg: palette.deepPurple }}
              >
                View Products
              </Button>
            </Link>
          </Box>

          <Box
            p={6}
            shadow="lg"
            borderWidth="2px"
            borderRadius="lg"
            borderColor={palette.lightPurple}
            bg="whiteAlpha.900"
          >
            <Heading as="h3" size="md" mb={4} color={palette.deepPurple}>
              Sign In
            </Heading>
            <Text mb={4} color="gray.700">
              Access your account to start shopping
            </Text>
            <Link href="/login" passHref>
              <Button
                bg={palette.deepPurple}
                color="white"
                _hover={{ bg: palette.purple }}
              >
                Login
              </Button>
            </Link>
          </Box>

          <Box
            p={6}
            shadow="lg"
            borderWidth="2px"
            borderRadius="lg"
            borderColor={palette.mediumPurple}
            bg="whiteAlpha.900"
          >
            <Heading as="h3" size="md" mb={4} color={palette.pink}>
              New Customer?
            </Heading>
            <Text mb={4} color="gray.700">
              Create an account to get started
            </Text>
            <Link href="/register" passHref>
              <Button
                bg={palette.pink}
                color="white"
                _hover={{ bg: palette.lightPurple }}
              >
                Register
              </Button>
            </Link>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
