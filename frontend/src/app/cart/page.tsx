"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  IconButton,
  Divider,
  useToast,
  Center,
  Flex,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingBag,
  FaArrowLeft,
  FaCalendarCheck,
  FaEdit,
} from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";
import PickupScheduler from "@/components/PickupScheduler";

const palette = {
  pink: "#ffb2e6",
  lightPurple: "#e382f9",
  mediumPurple: "#b388eb",
  purple: "#9a52ff",
  deepPurple: "#8447ff",
};

export default function Cart() {
  const { state, dispatch } = useCart();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const updateQuantity = (id: string, newQuantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id, quantity: newQuantity },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
      status: "info",
      duration: 3000,
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
      status: "info",
      duration: 3000,
    });
  };

  const handlePickupInfoChange = (pickupInfo: any) => {
    dispatch({ type: "SET_PICKUP_INFO", payload: pickupInfo });
  };

  const handleScheduleConfirmed = () => {
    // Close the modal when schedule is confirmed
    onClose();
  };

  const processOrder = async () => {
    if (!state.pickupInfo) {
      toast({
        title: "Pickup information required",
        description: "Please schedule your pickup before placing the order",
        status: "warning",
        duration: 4000,
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData = {
        items: state.items,
        total: state.total,
        pickupInfo: state.pickupInfo,
        orderDate: new Date().toISOString(),
        orderId: `ORDER-${Date.now()}`,
      };

      console.log("Processing order:", orderData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderData)
      // });

      toast({
        title: "Order placed successfully! 🎉",
        description: `Your order has been confirmed for pickup on ${new Date(state.pickupInfo.date).toLocaleDateString()}`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });

      // Clear cart after successful order
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        title: "Order failed",
        description:
          "There was an error processing your order. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const tax = state.total * 0.08;
  const finalTotal = state.total + tax;

  if (state.items.length === 0) {
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
        <Container maxW="container.md" py={10} position="relative" zIndex={1}>
          <Center>
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
                <FaShoppingBag size={80} color="#CBD5E0" />
                <Heading size="xl" color="gray.800">
                  Your cart is empty
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Add some products to schedule your pickup!
                </Text>
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
                    Start Shopping
                  </Button>
                </Link>
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

      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        {/* Back to Products Link */}
        <Link href="/products" passHref>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            mb={6}
          >
            Continue Shopping
          </Button>
        </Link>

        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          {/* Cart Items */}
          <Box flex={2}>
            <Box
              p={6}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              borderWidth="2px"
              borderColor="whiteAlpha.300"
            >
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.800">
                  Your Order ({state.itemCount} items)
                </Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  color="red.500"
                  onClick={clearCart}
                  _hover={{ bg: "red.50" }}
                >
                  Clear Cart
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {state.items.map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="gray.200"
                    bg="white"
                  >
                    <Flex align="center" gap={4}>
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="/placeholder.svg?height=100&width=100&text=Product"
                      />

                      <Box flex={1}>
                        <Heading size="md" color="gray.800" mb={1}>
                          {item.name}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          ${item.price.toFixed(2)} each
                        </Text>
                      </Box>

                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Decrease quantity"
                          icon={<FaMinus />}
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          isDisabled={item.quantity <= 1}
                        />
                        <Text
                          minW="40px"
                          textAlign="center"
                          fontWeight="medium"
                        >
                          {item.quantity}
                        </Text>
                        <IconButton
                          aria-label="Increase quantity"
                          icon={<FaPlus />}
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        />
                      </HStack>

                      <VStack spacing={2} align="end">
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          color={palette.purple}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                        <IconButton
                          aria-label="Remove item"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                        />
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pickup Information Display */}
            {state.pickupInfo && (
              <Box
                mt={6}
                p={6}
                bg="whiteAlpha.900"
                borderRadius="xl"
                shadow="2xl"
                borderWidth="2px"
                borderColor="green.200"
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color="green.600">
                    📅 Pickup Scheduled
                  </Heading>
                  <Button
                    size="sm"
                    leftIcon={<FaEdit />}
                    variant="outline"
                    colorScheme="green"
                    onClick={onOpen}
                  >
                    Edit
                  </Button>
                </Flex>
                <VStack align="start" spacing={2}>
                  <Text>
                    <strong>Date:</strong>{" "}
                    {new Date(state.pickupInfo.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Text>
                  <Text>
                    <strong>Time:</strong>{" "}
                    {new Date(
                      `2000-01-01T${state.pickupInfo.time}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                  <Text>
                    <strong>Name:</strong> {state.pickupInfo.customerName}
                  </Text>
                  <Text>
                    <strong>Phone:</strong> {state.pickupInfo.customerPhone}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {state.pickupInfo.customerEmail}
                  </Text>
                  {state.pickupInfo.notes && (
                    <Text>
                      <strong>Notes:</strong> {state.pickupInfo.notes}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}
          </Box>

          {/* Order Summary */}
          <Box flex={1}>
            <Box
              p={6}
              bg="whiteAlpha.900"
              borderRadius="xl"
              shadow="2xl"
              borderWidth="2px"
              borderColor="whiteAlpha.300"
              position="sticky"
              top={6}
            >
              <Heading size="lg" color="gray.800" mb={6}>
                Order Summary
              </Heading>

              <VStack spacing={4} align="stretch">
                <Flex justify="space-between">
                  <Text>Subtotal</Text>
                  <Text fontWeight="medium">${state.total.toFixed(2)}</Text>
                </Flex>

                <Flex justify="space-between">
                  <Text>Tax</Text>
                  <Text fontWeight="medium">${tax.toFixed(2)}</Text>
                </Flex>

                <Divider />

                <Flex justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    Total
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color={palette.purple}>
                    ${finalTotal.toFixed(2)}
                  </Text>
                </Flex>

                {!state.pickupInfo && (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Please schedule your pickup to place the order
                    </Text>
                  </Alert>
                )}

                <Button
                  size="lg"
                  bgGradient={`linear(to-r, ${palette.mediumPurple}, ${palette.purple})`}
                  color="white"
                  _hover={{
                    bgGradient: `linear(to-r, ${palette.purple}, ${palette.deepPurple})`,
                    transform: "translateY(-1px)",
                  }}
                  py={6}
                  fontSize="lg"
                  shadow="xl"
                  transition="all 0.3s"
                  leftIcon={<FaCalendarCheck />}
                  onClick={onOpen}
                >
                  {state.pickupInfo ? "Update Pickup" : "Schedule Pickup"}
                </Button>

                <Button
                  size="lg"
                  bgGradient={`linear(to-r, ${palette.purple}, ${palette.deepPurple})`}
                  color="white"
                  _hover={{
                    bgGradient: `linear(to-r, ${palette.deepPurple}, ${palette.purple})`,
                    transform: "translateY(-2px)",
                  }}
                  py={6}
                  fontSize="lg"
                  shadow="xl"
                  transition="all 0.3s"
                  onClick={processOrder}
                  isLoading={isProcessingOrder}
                  loadingText="Processing..."
                  isDisabled={!state.pickupInfo}
                >
                  Place Order
                </Button>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>

      {/* Pickup Scheduler Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule Your Pickup</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PickupScheduler
              onPickupInfoChange={handlePickupInfoChange}
              onScheduleConfirmed={handleScheduleConfirmed}
              initialPickupInfo={state.pickupInfo}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
