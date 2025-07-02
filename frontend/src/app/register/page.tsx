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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });

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
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
