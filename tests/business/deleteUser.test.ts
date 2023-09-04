import { ZodError } from "zod"
import { UserBusiness } from "../../src/business/UserBusiness"
import { DeleteUserSchema } from "../../src/dtos/user/deleteUser.dto"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"
import { BadRequestError } from "../../src/errors/BadRequestError"
import { BaseError } from "../../src/errors/BaseError"

describe("Testando deleteUser", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve deletar user", async () => {
    const input = DeleteUserSchema.parse({
      idToDelete: "id-mock-fulano",
      token: "token-mock-fulano"
    })

    const output = await userBusiness.deleteUser(input)

    expect(output).toEqual({
      message: "Deleção realizada com sucesso"
    })
  })

  test("erro de token vazio", async () => {
    expect.assertions(2)

    try {
      const input = DeleteUserSchema.parse(
        {
          idToDelete: "id-mock-fulano",
          token: ""  
        }
      )

      await userBusiness.deleteUser(input)
    } catch (error) {
      expect(error).toBeDefined()
      expect(error instanceof ZodError).toBe(true)
    }
  })

  test("erro de token inválido", async () => {
    expect.assertions(3)

    try {
      const input = DeleteUserSchema.parse(
        {
          idToDelete: "id-mock-fulano",
          token: "aaaaaa"  
        }
      )

      await userBusiness.deleteUser(input)

    } catch (error) {
      expect(error).toBeDefined()
      expect(error instanceof BadRequestError).toBe(true)
      if(error instanceof BaseError) {
        expect(error.message).toBe("token inválido")
      }
    }
  })

  test("Verificar direito de deletar", async () => {

    expect.assertions(3)

    try {
      const input = DeleteUserSchema.parse({
        idToDelete: "id-mock",
        token: "token-mock-fulano"
      })

      await userBusiness.deleteUser(input)

    } catch (error) {
      expect(error).toBeDefined()
      expect(error instanceof BadRequestError).toBe(true)
      if(error instanceof BaseError) {
        expect(error.message).toBe("somente quem criou a conta pode deletá-la")
      }
    }
  })
})
