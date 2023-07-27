"use client";
import { useState } from "react";
import {
  Container,
  VStack,
  Button,
  Heading,
  Input,
  useToast,
  SimpleGrid,
  Flex,
  Icon,
  Img,
  Box,
} from "@chakra-ui/react";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { supabase } from "@db/client";
import NextLink from "next/link";
import { ExternalLink } from "@/components/externalLink";
import { Subheader } from "@/components/subheader";
import { useFormik } from "formik";

interface SubmitForm {
  email: string;
  password: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);

  const statusToast = useToast();
  const router = useRouter();

  const submitForm = async ({ email, password }: SubmitForm) => {
    setLoading(true);

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      statusToast({
        title: "Login failed",
        description: error.message,
        status: "error",
      });
    } else {
      statusToast({
        title: "Signed in",
        description: "You are now authenticated",
        status: "success",
      });
      router.push("/");
    }

    setLoading(false);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: submitForm,
  });

  return (
    <>
      <Container maxW="container.xl" py={{ base: "32", lg: "20" }}>
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          px="4"
          alignItems="center"
          spacing="16"
        >
          <Box
            w="100%"
            h="100%"
            display={{ base: "none", lg: "block" }}
            position="relative"
          >
            <Img
              src="/static/images/windmills.jpg"
              alt="Windmills"
              borderRadius="lg"
              width="100%"
              h="2xl"
              objectFit="cover"
              filter="brightness(70%)"
            />
            <Heading
              as="h3"
              size="xl"
              position="absolute"
              zIndex="2"
              top="8"
              left="8"
              mr="20"
              color="white"
            >
              Back to join the fight for clean energy?
            </Heading>
          </Box>
          <form onSubmit={formik.handleSubmit}>
            <VStack
              align="flex-start"
              spacing="19"
              w={{ base: "100%", sm: "max-content" }}
              mx="auto"
            >
              <Heading as="h1" size="2xl">
                Login
              </Heading>
              <Subheader mt="-2" mb="1">
                Welcome Back
              </Subheader>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                onChange={formik.handleChange}
                value={formik.values.email}
                disabled={loading}
                w={{ base: "100%", sm: "sm" }}
                size="lg"
              />
              <Input
                id="password"
                type="password"
                placeholder="Password"
                onChange={formik.handleChange}
                value={formik.values.password}
                disabled={loading}
                w={{ base: "100%", sm: "sm" }}
                size="lg"
              />
              <ExternalLink href="/forgot-password">
                Forgot Password?
              </ExternalLink>
              <Button
                mt="2"
                colorScheme="brand"
                type="submit"
                isLoading={loading}
                loadingText="Signing in..."
                size="lg"
                rightIcon={<Icon as={FiArrowRight} />}
              >
                Continue
              </Button>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Login;
