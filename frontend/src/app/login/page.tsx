"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);

      toast({
        title: "Welcome back! 🎉",
        description: "You have been successfully logged in",
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
        duration: 3000,
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
      pt="80px"
    >
      {/* Animated background blobs */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="400px"
        h="400px"
        bgGradient={`radial(${palette.lightPurple}, ${palette.purple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
        animation="pulse 4s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="-120px"
        right="-120px"
        w="350px"
        h="350px"
        bgGradient={`radial(${palette.pink}, ${palette.mediumPurple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
        animation="pulse 4s ease-in-out infinite 2s"
      />

      <Container maxW="md" py={10} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              size="2xl"
              color="white"
              fontWeight="bold"
              textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            >
              Welcome Back to{" "}
              <Text
                as="span"
                bgGradient="linear(to-r, white, purple.100)"
                bgClip="text"
              >
                ShopLux
              </Text>
            </Heading>
            <Text
              fontSize="lg"
              color="whiteAlpha.900"
              textShadow="1px 1px 2px rgba(0,0,0,0.2)"
            >
              Sign in to continue your shopping journey
            </Text>
          </VStack>

          {/* Login Card */}
          <Box
            bg="whiteAlpha.950"
            borderRadius="2xl"
            shadow="2xl"
            p={8}
            borderWidth="2px"
            borderColor="whiteAlpha.300"
            backdropFilter="blur(10px)"
          >
            <VStack spacing={6} align="stretch">
              <VStack spacing={2} textAlign="center">
                <Heading size="lg" color="gray.800">
                  Sign In
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Enter your credentials to access your account
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Email Address
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaEnvelope color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        _focus={{
                          bg: "white",
                          borderColor: palette.purple,
                          boxShadow: `0 0 0 1px ${palette.purple}`,
                        }}
                        h={12}
                        fontSize="md"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium">
                      Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaLock color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        _focus={{
                          bg: "white",
                          borderColor: palette.purple,
                          boxShadow: `0 0 0 1px ${palette.purple}`,
                        }}
                        h={12}
                        fontSize="md"
                      />
                      <InputRightElement h={12}>
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          color="gray.400"
                          _hover={{ color: "gray.600" }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    h={12}
                    bgGradient={`linear(to-r, ${palette.purple}, ${palette.deepPurple})`}
                    color="white"
                    _hover={{
                      bgGradient: `linear(to-r, ${palette.deepPurple}, ${palette.purple})`,
                      transform: "translateY(-1px)",
                    }}
                    shadow="lg"
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    rightIcon={!isLoading ? <FaArrowRight /> : undefined}
                    fontSize="lg"
                    fontWeight="medium"
                  >
                    {isLoading ? <Spinner size="sm" /> : "Sign In"}
                  </Button>
                </VStack>
              </form>

              {/* Register Link - Better Integration */}
              <VStack spacing={6} pt={4}>
                <Text color="gray.600" fontSize="sm" textAlign="center">
                  Don't have an account yet?
                </Text>
                <Link href="/register" style={{ width: "100%" }}>
                  <Button
                    variant="outline"
                    size="lg"
                    w="full"
                    h={12}
                    borderColor="purple.200"
                    color="purple.600"
                    bg="transparent"
                    _hover={{
                      bg: "purple.50",
                      borderColor: "purple.300",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    fontSize="md"
                    fontWeight="medium"
                  >
                    Create New Account
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </Box>

          {/* Back to Home */}
          <Text textAlign="center">
            <Link href="/">
              <Text
                as="span"
                color="whiteAlpha.800"
                _hover={{ color: "white" }}
                transition="colors"
                fontSize="sm"
              >
                ← Back to Home
              </Text>
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
