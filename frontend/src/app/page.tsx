import { Box, Container, Heading, Text, Button, SimpleGrid } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to Our E-Commerce Store
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Discover amazing products at great prices
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading as="h3" size="md" mb={4}>
            Browse Products
          </Heading>
          <Text mb={4}>Explore our wide range of products</Text>
          <Link href="/products" passHref>
            <Button colorScheme="blue">View Products</Button>
          </Link>
        </Box>

        <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading as="h3" size="md" mb={4}>
            Sign In
          </Heading>
          <Text mb={4}>Access your account to start shopping</Text>
          <Link href="/login" passHref>
            <Button colorScheme="green">Login</Button>
          </Link>
        </Box>

        <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading as="h3" size="md" mb={4}>
            New Customer?
          </Heading>
          <Text mb={4}>Create an account to get started</Text>
          <Link href="/register" passHref>
            <Button colorScheme="purple">Register</Button>
          </Link>
        </Box>
      </SimpleGrid>
    </Container>
  );
} 