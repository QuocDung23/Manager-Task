import {
  ConflictException,
  HttpResponseBodySuccessDto,
  NotFoundException,
  OptionalException,
} from "@/common";
import { AuthRepository } from "./auth.repository";
import { RegisterRequestDto } from "./dtos/requests/register.req";
import { AccountResDto } from "./dtos/responses/account.res";
import { Exception } from "@tsed/exceptions";
import { genSalt, hash } from "bcrypt";
import { Prisma, UserStatus } from "@prisma/client";
import { LoginRequestDto } from "./dtos/requests";
import { StatusCodes } from "http-status-codes";
import { signJWT } from "@/common/utils/jwt.utils";
import { success } from "zod";
import { OtpService } from "../otps/otp.service";
import { SendOtpRequestDto } from "./dtos/requests/sendOTP.req";
import { LoginResponseDto } from "./dtos";
import { MailService } from "../mail/mail.service";

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly otpService = new OtpService(),
    private readonly mailService = new MailService()
  ) {}

  async register(
    registerDto: RegisterRequestDto,
  ): Promise<HttpResponseBodySuccessDto<AccountResDto> | Exception> {
    const user = await this.authRepository.findAccount({
      email: registerDto.email,
    });
    if (user) {
      throw new ConflictException("email");
    }
    const salt = await genSalt(10);
    const hashedPassword = await hash(registerDto.password, salt);

    const account: Prisma.accountsCreateInput = {
      salt: salt,
      password: hashedPassword,
      user: {
        create: {
          name: registerDto.name,
          email: registerDto.email,
        },
      },
    };

    const newAccount = await this.authRepository.createAccount({
      accounts: account,
    });
    await this.otpService.generateOtp({userId: newAccount.userId})

    return {
      success: true,
      data: new AccountResDto(newAccount),
    };
  }

  async login(loginRequestDto: LoginRequestDto): Promise<HttpResponseBodySuccessDto<LoginResponseDto> | Exception> {
    const account = await this.authRepository.findAccount({
      email: loginRequestDto.email,
    });
    if (!account) {
      throw new NotFoundException("email not found");
    }
    if (account.user?.status === UserStatus.LOCKED) {
      throw new OptionalException(
        StatusCodes.FORBIDDEN,
        "your account has been locked",
      );
    }

    const hashedPassword = await hash(loginRequestDto.password, account.salt);
    if (hashedPassword !== account.password) {
      throw new OptionalException(StatusCodes.UNAUTHORIZED, "invalid password");
    }
    const { accessToken, refreshToken } = await signJWT({
      userId: account.userId,
    });

    await this.authRepository.createToken({
      token: {
        refreshToken: refreshToken,
        user: {
          connect: {
            id: account.userId,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      cookies: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  // async sendOtp(sendOtpRequestDto: SendOtpRequestDto): Promise<HttpResponseBodySuccessDto<null> | Exception> {
  //   const {email} = sendOtpRequestDto
  //   const user = await this.authRepository.({email: email});
  //   if(!user) {
  //     throw new NotFoundException('email not found')
  //   }

  //   const otp = await this.otpService.generateOtp({userId: user.id})
  //   await this.mailService.sendMail({
  //     recipients: [
  //       {
  //         address: user.maiil,
  //         name: user.name
  //       }
  //     ]
  //   })
  // }
}
