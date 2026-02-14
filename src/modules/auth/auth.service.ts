import { ConflictException, HttpResponseBodySuccessDto } from "@/common";
import { AuthRepository } from "./auth.repository";
import { RegisterRequestDto } from "./dtos/requests/register.req";
import { AccountResDto } from "./dtos/responses/account.res";
import { Exception } from "@tsed/exceptions";
import { genSalt, hash } from "bcrypt";
import { Prisma } from "@prisma/client";

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

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

    const newAccount = await this.authRepository.createAccount({ accounts: account });

    return {
      success: true,
      data: new AccountResDto(newAccount)
    };
  }
}
