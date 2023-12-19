import { NextRequest } from "next/server";
import z from "zod";
import { auth, connectToDatabase } from "@lib";
import { LuciaError } from "lucia";
import { generateRandomString } from "lucia/utils";
import { logger, sendMail } from "@lib";
import { ServerResponse } from "@helpers";
import { ConfirmEmail } from "@emails";
import { User } from "@models";

const UserCreationSchema = z.object({
  first_name: z.string({ required_error: "First name is required" }),
  last_name: z.string({ required_error: "Last name is required" }),
  email_address: z
    .string({ required_error: "Email Address is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const POST = async (request: NextRequest) => {
  await connectToDatabase();

  let { first_name, last_name, email_address, password } = await request.json();

  email_address = email_address.toLowerCase();

  const validation = UserCreationSchema.safeParse({
    first_name,
    last_name,
    email_address,
    password,
  });

  if (validation.success) {
    try {
      const user = await auth.createUser({
        key: {
          providerId: "email_address",
          providerUserId: email_address,
          password,
        },
        attributes: {
          first_name,
          last_name,
          email_address,
          email_verified: false,
        },
      });

      const emailConfirmationToken = generateRandomString(64);

      await User.findOneAndUpdate(
        { email_address },
        {
          $set: {
            "email_verification_token.id": emailConfirmationToken,
          },
        }
      );

      const emailConfirmationURL = `${process.env.NEXT_PUBLIC_HOSTNAME}/api/auth/email-verification/${emailConfirmationToken}`;

      const email = await sendMail({
        to: email_address,
        subject: "Confirm your email address",
        emailComponent: ConfirmEmail({
          first_name,
          last_name,
          url: emailConfirmationURL,
        }),
      });

      logger.info(`Verification email sent (Msg Id: ${email.messageId})`);

      return ServerResponse.success(user);
    } catch (e) {
      logger.error(e);

      if (e instanceof LuciaError && e.message === `AUTH_DUPLICATE_KEY_ID`) {
        return ServerResponse.userError(
          "A user with this email address already exists"
        );
      }
      return ServerResponse.serverError();
    }
  } else {
    return ServerResponse.validationError(validation);
  }
};