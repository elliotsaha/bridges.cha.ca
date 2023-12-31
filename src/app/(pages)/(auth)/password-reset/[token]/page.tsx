'use client';

import {
  VStack,
  Heading,
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
  Input,
  Stack,
  Container,
  Box,
  Button,
  Icon,
  SimpleGrid,
  Img,
  useToast,
} from '@chakra-ui/react';
import {FiKey, FiArrowRight} from 'react-icons/fi';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import axios from 'axios';
import {DEFAULT_SERVER_ERR} from '@constants/error-messages';

const schema = z
  .object({
    new_password: z.string().min(8, {
      message: 'New password must be at least 8 characters long',
    }),
    confirm_password: z.string(),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type Form = z.infer<typeof schema>;

const Page = ({params}: {params: {token: string}}) => {
  const statusToast = useToast();
  const onSubmit = async ({new_password, confirm_password}: Form) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_HOSTNAME}/api/auth/password-reset/${params.token}`,
        {
          new_password,
          confirm_password,
        }
      );
      if (res.data) {
        statusToast({
          title: res.data.message,
          status: 'success',
        });
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        statusToast({
          title: e?.response?.data?.message || DEFAULT_SERVER_ERR,
          status: 'error',
        });
      }
    }
  };

  const {
    handleSubmit,
    register,
    formState: {errors, isSubmitting},
  } = useForm<Form>({resolver: zodResolver(schema)});
  return (
    <>
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
              src="/static/images/stock/skywindmill.jpeg"
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
              Keep your company secure.
            </Heading>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack
              alignItems="flex-start"
              spacing="19"
              w={{base: '100%', sm: 'max-content'}}
              mx="auto"
            >
              <Heading as="h1" size="2xl">
                Set new password
              </Heading>
              <FormControl isInvalid={Boolean(errors.new_password)}>
                <Stack>
                  <InputGroup>
                    <InputLeftAddon h="auto">
                      <FiKey />
                    </InputLeftAddon>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="New Password"
                      disabled={isSubmitting}
                      w={{base: '100%', sm: 'sm'}}
                      size="lg"
                      {...register('new_password')}
                    />
                  </InputGroup>
                </Stack>
                <FormErrorMessage>
                  {errors?.new_password?.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.confirm_password)}>
                <Stack>
                  <InputGroup>
                    <InputLeftAddon h="auto">
                      <FiKey />
                    </InputLeftAddon>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm Password"
                      disabled={isSubmitting}
                      w={{base: '100%', sm: 'sm'}}
                      size="lg"
                      {...register('confirm_password')}
                    />
                  </InputGroup>
                </Stack>
                <FormErrorMessage>
                  {errors?.confirm_password?.message}
                </FormErrorMessage>
              </FormControl>
              <Button
                mt="2"
                colorScheme="brand"
                type="submit"
                loadingText="Submitting..."
                size="lg"
                rightIcon={<Icon as={FiArrowRight} />}
                isLoading={isSubmitting}
              >
                Set Password
              </Button>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </>
  );
};

export default Page;
