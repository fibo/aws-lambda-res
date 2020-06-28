declare module 'aws-lambda-res' {
  interface ResponseObj {
    isBase64Encoded: boolean;
    statusCode: number;
    headers: any;
    body: null | string;
  }

  type awsLambdaResponse = (body: any, headers: any) => ResponseObj;

  export default function response(number): awsLambdaResponse;
}
