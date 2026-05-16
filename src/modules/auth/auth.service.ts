import {
  ConflictException,
  HttpResponseBodySuccessDto,
  InternalServerException,
  NotFoundException,
  OptionalException,
} from "@/common";
import { AuthRepository } from "./auth.repository";
import { RegisterRequestDto } from "./dtos/requests/register.req";
import { AccountResDto } from "./dtos/responses/account.res";
import { BadRequest, Exception } from "@tsed/exceptions";
import { genSalt, hash } from "bcrypt";
import { Prisma, UserStatus } from "@prisma/client";
import { LoginRequestDto, VerifyRequestDto } from "./dtos/requests";
import { StatusCodes } from "http-status-codes";
import { signJWT } from "@/common/utils/jwt.utils";
import { OtpService } from "../otps/otp.service";
import { SendOtpRequestDto } from "./dtos/requests/sendOTP.req";
import { LoginResponseDto } from "./dtos";
import { MailService } from "../mail/mail.service";
import { otpsConfig } from "@/configs";
import { UserRepository } from "../user/user.repository";
import { MyInfomationResDto } from "../user/dtos/response/myInfo.res";
import { ChangePasswordRequestDto } from "../user/dtos";
import { ResetPasswordRequestDto } from "./dtos/requests/resetPass.req";
import {
  LogoutResponseDto,
  ResetPasswordResponseDto,
  VerifyOtpResponseDto,
} from "./dtos/responses";

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly otpService = new OtpService(),
    private readonly mailService = new MailService(),
    private readonly userRepository = new UserRepository(),
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

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(registerDto.name)}&background=random&color=fff&size=256`;

    const account: Prisma.accountsCreateInput = {
      salt: salt,
      password: hashedPassword,
      user: {
        create: {
          name: registerDto.name,
          email: registerDto.email,
          status: UserStatus.PENDING,
          verify: false,
          avatar: defaultAvatar,
        },
      },
    };

    const newAccount = await this.authRepository.createAccount({
      accounts: account,
    });

    await this.authRepository.addUserRole(newAccount.userId, "USER");

    await this.sendOtp({ email: registerDto.email });

    return {
      success: true,
      data: new AccountResDto(newAccount),
    };
  }

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<HttpResponseBodySuccessDto<LoginResponseDto> | Exception> {
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

    if(account.user?.verify === false || account.user?.status === UserStatus.PENDING) {
      this.sendOtp({ email: account.user?.email ?? "" }).catch(
        (error) => {
          throw new InternalServerException();
     
        }
      );
    }

    const hashedPassword = await hash(loginRequestDto.password, account.salt);
    if (hashedPassword !== account.password) {
      throw new OptionalException(StatusCodes.UNAUTHORIZED, "invalid password");
    }
    const { accessToken, refreshToken } = await signJWT({
      userId: account.userId,
      email: account.user?.email,
      verify: account.user?.verify ?? false,
      status: account.user?.status,
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
        email: account.user?.email ?? loginRequestDto.email,
        verify: account.user?.verify ?? false,
        status: account.user?.status ?? UserStatus.PENDING,
        accessToken: accessToken,
        refreshToken: refreshToken,
        
      },
      cookies: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async sendOtp(
    sendOtpRequestDto: SendOtpRequestDto,
  ): Promise<HttpResponseBodySuccessDto<null> | Exception> {
    const { email } = sendOtpRequestDto;
    const user = await this.userRepository.findUser({ email: email });
    if (!user) {
      throw new NotFoundException("email not found");
    }

    const otp = await this.otpService.generateOtp({ userId: user.id });
    await this.mailService.sendMail({
      recipients: [
        {
          address: user.email,
          name: user.name,
        },
      ],
      subject: "Verification code",
      html: `Your verification code if ${otp.otp}. it's effective in ${otpsConfig.optExpires} minutes. Please don't share with anyone.`,
    });

    return {
      success: true,
      data: null,
    };
  }

  async verify(
    vefiryRequestDto: VerifyRequestDto,
  ): Promise<HttpResponseBodySuccessDto<AccountResDto | Exception>> {
    const { email, otp } = vefiryRequestDto;
    const account = await this.authRepository.findAccount({
      email: email,
      userStatus: UserStatus.PENDING,
    });
    if (!account || !account.user) {
      throw new NotFoundException("not account");
    }

    if (account.user.verify === true) {
      throw new OptionalException(
        StatusCodes.CONFLICT,
        "Account is already verified",
      );
    }

    const isValiOtp = await this.otpService.verifyOtp({
      userId: account.userId,
      otp: otp,
    });
    if (!isValiOtp) {
      throw new OptionalException(StatusCodes.BAD_REQUEST, "Invalid OTP");
    }

    await this.userRepository.updateUser({
      userId: account.userId,
      user: {
        verify: true,
        status: UserStatus.ACTIVE,
      },
    });

    const {accessToken, refreshToken} = await signJWT({
      userId: account.userId,
      email: account.user?.email,
      verify: true,
      status: UserStatus.ACTIVE,
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

    const accountRes = new AccountResDto(account);
    accountRes.verify = true;
    accountRes.accessToken = accessToken;
    accountRes.refreshToken = refreshToken;

    return {
      success: true,
      data: accountRes,
      cookies: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async refreshToken(
    myInfomation: MyInfomationResDto,
  ): Promise<HttpResponseBodySuccessDto<LoginResponseDto | Exception>> {
    const { accessToken, refreshToken } = await signJWT({
      userId: myInfomation.id,
      email: myInfomation.email,
      verify: myInfomation.verify ?? false,
      status: myInfomation.status,
    });

    await this.authRepository.createToken({
      token: {
        refreshToken: refreshToken,
        user: {
          connect: {
            id: myInfomation.id,
          },
        },
      },
    });

    const tokens = new LoginResponseDto();
    tokens.accessToken = accessToken;
    tokens.refreshToken = refreshToken;
    tokens.email = myInfomation.email;
    tokens.verify = myInfomation.verify;
    tokens.status = myInfomation.status;

    return {
      success: true,
      data: tokens,
      cookies: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async changPassword(
    userId: string,
    dto: ChangePasswordRequestDto,
  ): Promise<HttpResponseBodySuccessDto<void>> {
    const account = await this.authRepository.findAccountByUserId(userId);
    if (!account) {
      throw new NotFoundException("Not Found Account");
    }

    const hashCurrentPassword = await hash(dto.currentPassword, account.salt);
    if (hashCurrentPassword !== account.password) {
      throw new BadRequest("Current password is incorrect");
    }
    const newSalt = await genSalt(10);
    const newPassword = await hash(dto.newPassword, newSalt);

    await this.authRepository.updateAccountPassword({
      userId,
      passwordHash: newPassword,
      salt: newSalt,
    });

    return {
      success: true,
      data: undefined,
    };
  }

  async verifyOtp(
    dto: VerifyRequestDto,
  ): Promise<HttpResponseBodySuccessDto<VerifyOtpResponseDto>> {
    const user = await this.authRepository.findAccount({ email: dto.email });
    if (!user) {
      throw new NotFoundException("Email not found");
    }

    const isOtpValid = await this.otpService.verifyOtp({
      userId: user.userId,
      otp: dto.otp,
      deleteOtpAfterVerify: false,
    });
    if (!isOtpValid) {
      throw new BadRequest("Invalid OTP");
    }

    return {
      success: true,
      data: new VerifyOtpResponseDto(user.user?.email ?? dto.email, true),
    };
  }

  async resetPassword(
    dto: ResetPasswordRequestDto,
  ): Promise<HttpResponseBodySuccessDto<ResetPasswordResponseDto>> {
    const user = await this.authRepository.findAccount({ email: dto.email });
    if (!user) {
      throw new NotFoundException("Email not found");
    }

    const isOtpValid = await this.otpService.verifyOtp({
      userId: user.userId,
      otp: dto.otp,
    });
    if (!isOtpValid) {
      throw new BadRequest("Invalid OTP");
    }

    const newSalt = await genSalt(10);
    const newPassword = await hash(dto.newPassword, newSalt);

    await this.authRepository.updateAccountPassword({
      userId: user.userId,
      passwordHash: newPassword,
      salt: newSalt,
    });

    return {
      success: true,
      data: new ResetPasswordResponseDto(user.user?.email ?? dto.email, true),
    };
  }

  async logout(
    userId: string,
  ): Promise<HttpResponseBodySuccessDto<LogoutResponseDto>> {
    await this.authRepository.deleteTokenByUserId(userId);

    return {
      success: true,
      data: new LogoutResponseDto("Logout successfully"),
    };
  }
}
