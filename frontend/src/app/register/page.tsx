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
  HStack,
} from "@chakra-ui/react";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaCheckCircle,
} from "react-icons/fa";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phoneNumber: phone || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.customToken);
      localStorage.setItem("userEmail", email);

      toast({
        title: "Account created successfully! 🎉",
        description: "Welcome to ShopLux! You can now start shopping",
        status: "success",
        duration: 3000,
      });

      router.push("/products");
    } catch (error) {
      toast({
        title: "Registration failed",
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
        top="-120px"
        right="-120px"
        w="400px"
        h="400px"
        bgGradient={`radial(${palette.pink}, ${palette.purple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
        animation="pulse 4s ease-in-out infinite"
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
        animation="pulse 4s ease-in-out infinite 1.5s"
      />

      <Container maxW="lg" py={10} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              size="2xl"
              color="white"
              fontWeight="bold"
              textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            >
              Join{" "}
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
              Create your account and start shopping today
            </Text>
          </VStack>

          {/* Register Card */}
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
                  Create Account
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Fill in your details to get started
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Name Fields - Fixed Grid Layout */}
                  <HStack spacing={4} w="full" align="start">
                    <FormControl isRequired flex={1}>
                      <FormLabel
                        color="gray.700"
                        fontWeight="medium"
                        fontSize="sm"
                        mb={2}
                      >
                        First Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" h={12}>
                          <FaUser color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
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
                          px={12}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired flex={1}>
                      <FormLabel
                        color="gray.700"
                        fontWeight="medium"
                        fontSize="sm"
                        mb={2}
                      >
                        Last Name
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" h={12}>
                          <FaUser color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
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
                          px={12}
                        />
                      </InputGroup>
                    </FormControl>
                  </HStack>

                  {/* Email Field */}
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" mb={2}>
                      Email Address
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h={12}>
                        <FaEnvelope color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
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
                        px={12}
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontWeight="medium" mb={2}>
                      Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h={12}>
                        <FaLock color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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
                        px={12}
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

                  {/* Phone Field */}
                  <FormControl>
                    <FormLabel color="gray.700" fontWeight="medium" mb={2}>
                      Phone Number{" "}
                      <Text as="span" color="gray.400" fontSize="xs">
                        (Optional)
                      </Text>
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" h={12}>
                        <FaPhone color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        px={12}
                      />
                    </InputGroup>
                  </FormControl>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    h={14}
                    bgGradient={`linear(to-r, ${palette.pink}, ${palette.purple})`}
                    color="white"
                    _hover={{
                      bgGradient: `linear(to-r, ${palette.mediumPurple}, ${palette.deepPurple})`,
                      transform: "translateY(-1px)",
                    }}
                    shadow="lg"
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    isLoading={isLoading}
                    loadingText="Creating Account..."
                    leftIcon={!isLoading ? <FaCheckCircle /> : undefined}
                    fontSize="lg"
                    fontWeight="medium"
                    mt={2}
                  >
                    {isLoading ? <Spinner size="sm" /> : "Create Account"}
                  </Button>
                </VStack>
              </form>

              {/* Login Link - Better Integration */}
              <VStack spacing={6} pt={4}>
                <Text color="gray.600" fontSize="sm" textAlign="center">
                  Already have an account?
                </Text>
                <Link href="/login" style={{ width: "100%" }}>
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
                    Sign In Instead
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
