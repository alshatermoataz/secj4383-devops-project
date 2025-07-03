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
import Link from "next/link";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Register() {
  // ──────────────────── state ────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // optional
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const toast = useToast();

  // ───────────────── handle submit ────────────────
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
          phoneNumber: phone || undefined, // omit if empty
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }

      const data = await res.json();

      // 🔐 Store token so the user stays logged-in
      localStorage.setItem("token", data.customToken);

      toast({
        title: "Registration successful",
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
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────── ui ────────────────────────
  return (
    <Box
      minH="100vh"
      position="relative"
      bgGradient={`linear(135deg, ${palette.pink} 0%, ${palette.lightPurple} 25%, ${palette.mediumPurple} 50%, ${palette.purple} 75%, ${palette.deepPurple} 100%)`}
      overflow="hidden"
    >
      {/* blurred blob for flair */}
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="350px"
        h="350px"
        bgGradient={`radial(${palette.pink}, ${palette.purple}, transparent)`}
        filter="blur(80px)"
        zIndex={0}
      />

      <Container maxW="container.sm" py={10} position="relative" zIndex={1}>
        <VStack spacing={8}>
          <Heading color="white" textShadow="0 2px 16px #b388eb">
            Create an Account
          </Heading>

          <Box
            w="100%"
            p={8}
            borderWidth={2}
            borderRadius="lg"
            boxShadow="lg"
            borderColor={palette.pink}
            bg="whiteAlpha.900"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>

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

                <FormControl>
                  <FormLabel>Phone (Number)</FormLabel>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormControl>

                <Button
                  type="submit"
                  bg={palette.pink}
                  color="white"
                  _hover={{ bg: palette.lightPurple }}
                  width="100%"
                  isLoading={isLoading}
                >
                  Register
                </Button>
              </VStack>
            </form>
          </Box>

          <Text color="whiteAlpha.900">
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: palette.deepPurple,
                fontWeight: 700,
                textShadow: "0 1px 8px #fff, 0 1px 8px #b388eb",
                textDecoration: "underline",
              }}
            >
              Login here
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
