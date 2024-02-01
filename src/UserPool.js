import { CognitoUserPool } from "amazon-cognito-identity-js"

// const poolData = {
//     UserPoolId: "us-east-1_odRTFwzyd",
//     ClientId: "4l84spse2ps61qtsqek6b99i4a"
// } 

const poolData = {
    UserPoolId: "us-east-1_x9aJ00kus",
    ClientId: "2n7vboe7lbprtfvp1i70sk3ffe"
} 

export default new CognitoUserPool(poolData)