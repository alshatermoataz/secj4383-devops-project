"use client";

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useCallback } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCheck,
} from "react-icons/fa";

interface PickupInfo {
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

interface PickupSchedulerProps {
  onPickupInfoChange: (pickupInfo: PickupInfo) => void;
  onScheduleConfirmed?: () => void;
  initialPickupInfo?: PickupInfo | null;
}

export default function PickupScheduler({
  onPickupInfoChange,
  onScheduleConfirmed,
  initialPickupInfo,
}: PickupSchedulerProps) {
  const [pickupInfo, setPickupInfo] = useState<PickupInfo>({
    date: initialPickupInfo?.date || "",
    time: initialPickupInfo?.time || "",
    customerName: initialPickupInfo?.customerName || "",
    customerPhone: initialPickupInfo?.customerPhone || "",
    customerEmail: initialPickupInfo?.customerEmail || "",
    notes: initialPickupInfo?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!pickupInfo.date) {
      newErrors.date = "Pickup date is required";
    } else {
      // Check if date is not in the past
      const selectedDate = new Date(pickupInfo.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Pickup date cannot be in the past";
      }
    }

    if (!pickupInfo.time) {
      newErrors.time = "Pickup time is required";
    }

    if (!pickupInfo.customerName.trim()) {
      newErrors.customerName = "Name is required";
    } else if (pickupInfo.customerName.trim().length < 2) {
      newErrors.customerName = "Name must be at least 2 characters";
    }

    if (!pickupInfo.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    } else if (
      !/^\+?[\d\s\-$$$$]{10,}$/.test(
        pickupInfo.customerPhone.replace(/\s/g, "")
      )
    ) {
      newErrors.customerPhone =
        "Please enter a valid phone number (at least 10 digits)";
    }

    if (!pickupInfo.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pickupInfo.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    return { errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
  }, [pickupInfo]);

  const handleInputChange = (field: keyof PickupInfo, value: string) => {
    const updatedInfo = { ...pickupInfo, [field]: value };
    setPickupInfo(updatedInfo);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast({
        title: "Please fix the errors",
        description: "Check all required fields and try again",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the parent component's callback
      onPickupInfoChange(pickupInfo);

      toast({
        title: "Pickup scheduled! 📅",
        description: `Your pickup is confirmed for ${new Date(pickupInfo.date).toLocaleDateString()} at ${new Date(
          `2000-01-01T${pickupInfo.time}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Call the confirmation callback if provided
      if (onScheduleConfirmed) {
        onScheduleConfirmed();
      }
    } catch (error) {
      toast({
        title: "Error scheduling pickup",
        description: "Please try again",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="xl"
      shadow="lg"
      borderWidth="2px"
      borderColor="purple.100"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="purple.600" textAlign="center">
          📅 Schedule Your Pickup
        </Heading>

        <Text fontSize="sm" color="gray.600" textAlign="center">
          Choose your preferred pickup date and time, and provide your contact
          information.
        </Text>

        {/* Date and Time Selection */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.date} flex={1}>
            <FormLabel color="gray.700">
              <HStack>
                <FaCalendarAlt />
                <Text>Pickup Date *</Text>
              </HStack>
            </FormLabel>
            <Input
              type="date"
              value={pickupInfo.date}
              min={getMinDate()}
              max={getMaxDate()}
              onChange={(e) => handleInputChange("date", e.target.value)}
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "purple.400" }}
            />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.time} flex={1}>
            <FormLabel color="gray.700">
              <HStack>
                <FaClock />
                <Text>Pickup Time *</Text>
              </HStack>
            </FormLabel>
            <Select
              value={pickupInfo.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              placeholder="Select time"
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "purple.400" }}
            >
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.time}</FormErrorMessage>
          </FormControl>
        </HStack>

        {/* Customer Information */}
        <VStack spacing={4} align="stretch">
          <Heading size="sm" color="gray.700">
            Contact Information
          </Heading>

          <FormControl isInvalid={!!errors.customerName}>
            <FormLabel color="gray.700">
              <HStack>
                <FaUser />
                <Text>Full Name *</Text>
              </HStack>
            </FormLabel>
            <Input
              value={pickupInfo.customerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
              placeholder="Enter your full name"
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "purple.400" }}
            />
            <FormErrorMessage>{errors.customerName}</FormErrorMessage>
          </FormControl>

          <HStack spacing={4}>
            <FormControl isInvalid={!!errors.customerPhone} flex={1}>
              <FormLabel color="gray.700">
                <HStack>
                  <FaPhone />
                  <Text>Phone Number *</Text>
                </HStack>
              </FormLabel>
              <Input
                value={pickupInfo.customerPhone}
                onChange={(e) =>
                  handleInputChange("customerPhone", e.target.value)
                }
                placeholder="(555) 123-4567"
                bg="gray.50"
                _focus={{ bg: "white", borderColor: "purple.400" }}
              />
              <FormErrorMessage>{errors.customerPhone}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.customerEmail} flex={1}>
              <FormLabel color="gray.700">
                <HStack>
                  <FaEnvelope />
                  <Text>Email Address *</Text>
                </HStack>
              </FormLabel>
              <Input
                type="email"
                value={pickupInfo.customerEmail}
                onChange={(e) =>
                  handleInputChange("customerEmail", e.target.value)
                }
                placeholder="your@email.com"
                bg="gray.50"
                _focus={{ bg: "white", borderColor: "purple.400" }}
              />
              <FormErrorMessage>{errors.customerEmail}</FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel color="gray.700">
              Special Instructions (Optional)
            </FormLabel>
            <Textarea
              value={pickupInfo.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special instructions or notes for your pickup..."
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "purple.400" }}
              rows={3}
            />
          </FormControl>
        </VStack>

        {/* Pickup Information Preview */}
        {pickupInfo.date && pickupInfo.time && pickupInfo.customerName && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                Pickup Preview:
              </Text>
              <Text fontSize="sm">
                <strong>{pickupInfo.customerName}</strong> on{" "}
                <strong>
                  {new Date(pickupInfo.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>{" "}
                at{" "}
                <strong>
                  {new Date(`2000-01-01T${pickupInfo.time}`).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </strong>
              </Text>
            </Box>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          size="lg"
          bgGradient="linear(to-r, purple.500, purple.600)"
          color="white"
          _hover={{
            bgGradient: "linear(to-r, purple.600, purple.700)",
            transform: "translateY(-1px)",
          }}
          leftIcon={<FaCheck />}
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Confirming..."
          shadow="lg"
          transition="all 0.2s"
          py={6}
          fontSize="lg"
        >
          Confirm Pickup Schedule
        </Button>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          * Required fields. You can modify your pickup details before placing
          the final order.
        </Text>
      </VStack>
    </Box>
  );
}
