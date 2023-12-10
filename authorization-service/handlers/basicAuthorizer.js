
const generatePolicy = (
  principalId,
  resource,
  effect
) => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

export const handler = async (event, _, cb) => {
  if (event["type"] !== "TOKEN") {
    //401
    cb("Unauthorized");
  }
  try {
    const authToken = event.authorizationToken;
    console.log('token', authToken);
    const methodArn = event.methodArn;
    console.log('methodArn', methodArn);

    const creds = authToken.split(" ")[1];
    console.log('creds', creds);
    // Decode the base64 string
    const decodedData = Buffer.from(creds, "base64").toString("utf8");
    console.log('decodedData', decodedData);

    const splittedData = decodedData.split(":");

    const userName = splittedData[0];

    const password = splittedData[1];
    console.log('name and password', userName, password);
    const storedPassword = process.env[userName];
    console.log('stored password', storedPassword);

    const access =
      !storedPassword || storedPassword !== password ? "Deny" : "Allow";

    console.log('access', access);

    const policy = generatePolicy(creds, methodArn, access);

    console.log('policy', policy);

    cb(null, policy);
  } catch (error) {
    //403
    cb(`Unauthorized: ${error.message}`);
  }
};


