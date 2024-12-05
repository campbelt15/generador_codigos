import { CognitoUserPool } from "amazon-cognito-identity-js"

const UserPool = process.env.REACT_APP_CLIENT_ID
const Client = process.env.REACT_APP_USER_POOL_ID

const poolData = {
  UserPoolId: Client,
  ClientId: UserPool
}

export default new CognitoUserPool(poolData)
