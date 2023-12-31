'use client';
import {useEffect} from 'react';
import {
  Container,
  VStack,
  Button,
  Heading,
  Input,
  useToast,
  SimpleGrid,
  Icon,
  Img,
  Box,
  FormControl,
  FormErrorMessage,
  Link,
} from '@chakra-ui/react';
import {useForm} from 'react-hook-form';
import {FiArrowRight} from 'react-icons/fi';
import {Subheader} from '@components';
import {useSearchParams} from 'next/navigation';
import {authBroadcast} from '@broadcasts';
import z from 'zod';
import axios from 'axios';
import {ZOD_ERR} from '@constants';
import {zodResolver} from '@hookform/resolvers/zod';

const schema = z.object({
  email_address: z.string().email(ZOD_ERR.INVALID_EMAIL),
  password: z.string().min(1, ZOD_ERR.REQ_FIELD),
});

type Form = z.infer<typeof schema>;

const Login = () => {
  const statusToast = useToast();
  const params = useSearchParams();
  const redirectURL = params.get('redirect');
  const confirmationStatus = params.get('confirmation-status');
  const recoveryStatus = params.get('recovery-status');

  useEffect(() => {
    if (recoveryStatus === 'true') {
      statusToast({
        title: 'Password reset successful. Please login',
        status: 'success',
      });
    }
  }, [recoveryStatus]);

  useEffect(() => {
    // only render statusToast if param is actually set in url
    if (confirmationStatus) {
      if (confirmationStatus === 'true') {
        statusToast({
          title: 'Email address successfully confirmed',
          status: 'success',
        });
      } else {
        statusToast({
          title: 'Invalid email address confirmation token',
          status: 'error',
        });
      }
    }
  }, [confirmationStatus, statusToast]);

  useEffect(() => {
    if (redirectURL) {
      statusToast({
        title: 'Sign in first',
        description: 'Please sign in before proceeding',
        status: 'info',
      });
    }
  }, [redirectURL, statusToast]);

  const redirect = () => {
    if (redirectURL) {
      // need full page reload to account for auth state change
      window.location.href = redirectURL;
    } else {
      // redirect home if no redirect url is specified
      window.location.href = '/';
    }
  };

  const {
    handleSubmit,
    register,
    formState: {errors, isSubmitting},
  } = useForm<Form>({resolver: zodResolver(schema)});

  const onSubmit = async ({email_address, password}: Form) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/api/auth/login`, {
        email_address,
        password,
      });

      authBroadcast.postMessage('reload-auth');
      redirect();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        statusToast({
          title: e?.response?.data?.message,
          status: 'error',
        });
      }
    }
  };

  return (
    <Container maxW="container.xl" py={{base: '32', lg: '20'}}>
      <SimpleGrid
        columns={{base: 1, lg: 2}}
        px="4"
        alignItems="center"
        spacing="16"
      >
        <Box
          w="100%"
          h="100%"
          display={{base: 'none', lg: 'block'}}
          position="relative"
        >
          <Img
            src="/static/images/stock/windmill.jpg"
            alt="Windmill"
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack
            align="flex-start"
            spacing="19"
            w={{base: '100%', sm: 'max-content'}}
            mx="auto"
          >
            <Heading as="h1" size="2xl">
              Login
            </Heading>
            <Subheader mt="-2" mb="1">
              Welcome Back
            </Subheader>
            <FormControl isInvalid={Boolean(errors.email_address)}>
              <Input
                id="email_address"
                type="email"
                placeholder="Email Address"
                disabled={isSubmitting}
                w={{base: '100%', sm: 'sm'}}
                size="lg"
                {...register('email_address')}
              />
              <FormErrorMessage>
                {errors?.email_address?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors.password)}>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                disabled={isSubmitting}
                w={{base: '100%', sm: 'sm'}}
                size="lg"
                {...register('password')}
              />
              <FormErrorMessage>{errors?.password?.message}</FormErrorMessage>
            </FormControl>
            <Link
              href="/password-reset"
              color="gray.500"
              textDecoration="underline"
            >
              Forgot password?
            </Link>
            <Button
              colorScheme="brand"
              type="submit"
              isLoading={isSubmitting}
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
  );
};

export default Login;
