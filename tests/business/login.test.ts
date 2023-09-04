import { ZodError } from "zod"
import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginSchema } from "../../src/dtos/user/login.dto"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"
import { NotFoundError } from "../../src/errors/NotFoundError"
import { BaseError } from "../../src/errors/BaseError"
import { BadRequestError } from "../../src/errors/BadRequestError"


describe("Testando login", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve gerar um token ao logar", async () => {
    const input = LoginSchema.parse({
      email: "fulano@email.com",
      password: "fulano123"
    })

    const output = await userBusiness.login(input)

    expect(output).toEqual({
      message: "Login realizado com sucesso",
      token: "token-mock-fulano"
    })
  })

  test("e-mail não é string", async () => {
    expect.assertions(2)

    try {
      const input = LoginSchema.parse({
        email: [],
        password: "fulano123"
      })

      const output = await userBusiness.login(input)
    } catch (error) {
      expect(error).toBeDefined()
      expect(error instanceof ZodError).toBe(true)
    }
  })

  test("e-mail não encontrado", async () => {
    expect.assertions(2)

    try {
      const input = LoginSchema.parse({
        email: "email@qualquer.com",
        password: "fulano123"
      })

      const output = await userBusiness.login(input)
    } catch (error) {
      expect(error instanceof NotFoundError).toBe(true)
      if(error instanceof BaseError){
        expect(error.message).toBe("'email' não encontrado")
      }
    }
  })
  test("e-mail inválido", async () => {
    expect.assertions(2)

    try {
      const input = LoginSchema.parse({
        email: "fulano@email.com",
        password: "fulano-senha-incorreta"
      })

      const output = await userBusiness.login(input)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError)
      if(error instanceof BaseError){
        expect(error.message).toBe("'email' ou 'password' incorretos")
      }
    }
  })

})
