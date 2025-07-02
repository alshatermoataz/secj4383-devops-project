"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
      });
      router.push("/products");
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        left="-100px"
        w="350px"
        h="350px"
        bgGradient={`radial(${palette.lightPurple}, ${palette.purple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
      />
      <Container maxW="container.sm" py={10} position="relative" zIndex={1}>
        <VStack spacing={8}>
          <Heading color="white" textShadow="0 2px 16px #b388eb">
            Login to Your Account
          </Heading>
          <Box
            w="100%"
            p={8}
            borderWidth={2}
            borderRadius="lg"
            boxShadow="lg"
            borderColor={palette.purple}
            bg="whiteAlpha.900"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button
                  type="submit"
                  bg={palette.purple}
                  color="white"
                  _hover={{ bg: palette.deepPurple }}
                  width="100%"
                  isLoading={isLoading}
                >
                  Login
                </Button>
              </VStack>
            </form>
          </Box>
          <Text color="whiteAlpha.900">
            Don't have an account?{" "}
            <Link
              href="/register"
              style={{
                color: palette.deepPurple,
                fontWeight: 700,
                textShadow: "0 1px 4px #fff, 0 1px 4px #b388eb",
                textDecoration: "underline",
              }}
            >
              Register here
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
