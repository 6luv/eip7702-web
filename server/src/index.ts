import express from "express";
import cors from "cors";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/server";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

type UserCredential = {
  id: string;
  publicKey: ReturnType<Uint8Array["slice"]>;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
};

type UserRecord = {
  id: string;
  email: string;
  name?: string;
  currentChallenge?: string;
  credentials: UserCredential[];
};

const users = new Map<string, UserRecord>();

const rpName = "7702 Pay Demo";
const rpID = "localhost";
const origin = "http://localhost:5173";

function getOrCreateUser(email: string, name?: string) {
  const existing = users.get(email);
  if (existing) return existing;

  const next: UserRecord = {
    id: crypto.randomUUID(),
    email,
    name,
    credentials: [],
  };

  users.set(email, next);
  return next;
}

app.post("/api/webauthn/register/options", async (req, res) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = getOrCreateUser(email, name);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
        authenticatorAttachment: "platform",
      },
      excludeCredentials: user.credentials.map((cred) => ({
        id: cred.id,
        transports: cred.transports,
      })),
    });

    user.currentChallenge = options.challenge;
    return res.json(options);
  } catch (error) {
    console.error("register/options error", error);
    return res.status(500).json({ error: "failed to generate options" });
  }
});

app.post("/api/webauthn/register/verify", async (req, res) => {
  try {
    const { email, credential } = req.body as {
      email?: string;
      credential?: Parameters<typeof verifyRegistrationResponse>[0]["response"];
    };

    if (!email || !credential) {
      return res
        .status(400)
        .json({ error: "email and credential are required" });
    }

    const user = users.get(email);
    if (!user || !user.currentChallenge) {
      return res.status(400).json({ error: "user or challenge not found" });
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error("verifyRegistrationResponse error", error);
      return res.status(400).json({ ok: false, error: "verification failed" });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential: regCred } = registrationInfo;

      user.credentials.push({
        id: regCred.id,
        publicKey: regCred.publicKey,
        counter: regCred.counter,
        transports: credential.response.transports,
      });
    }

    user.currentChallenge = undefined;

    return res.json({
      ok: verified,
      credentialCount: user.credentials.length,
    });
  } catch (error) {
    console.error("register/verify error", error);
    return res.status(500).json({ ok: false, error: "server error" });
  }
});

app.post("/api/webauthn/authenticate/options", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = users.get(email);
    if (!user || user.credentials.length === 0) {
      return res.status(400).json({ error: "registered passkey not found" });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: user.credentials.map((cred) => ({
        id: cred.id,
        transports: cred.transports,
      })),
    });

    user.currentChallenge = options.challenge;

    return res.json(options);
  } catch (error) {
    console.error("authenticate/options error", error);
    return res
      .status(500)
      .json({ error: "failed to generate authentication options" });
  }
});

app.post("/api/webauthn/authenticate/verify", async (req, res) => {
  try {
    const { email, credential } = req.body as {
      email?: string;
      credential?: Parameters<
        typeof verifyAuthenticationResponse
      >[0]["response"];
    };

    if (!email || !credential) {
      return res
        .status(400)
        .json({ error: "email and credential are required" });
    }

    const user = users.get(email);
    if (!user || !user.currentChallenge) {
      return res.status(400).json({ error: "user or challenge not found" });
    }

    const dbCredential = user.credentials.find(
      (cred) => cred.id === credential.id,
    );
    if (!dbCredential) {
      return res.status(400).json({ ok: false, error: "credential not found" });
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: dbCredential.id,
          publicKey: dbCredential.publicKey,
          counter: dbCredential.counter,
          transports: dbCredential.transports,
        },
      });

      const { verified, authenticationInfo } = verification;

      if (verified) {
        dbCredential.counter = authenticationInfo.newCounter;
      }

      user.currentChallenge = undefined;

      return res.json({
        ok: verified,
        paymentApproved: verified,
      });
    } catch (error) {
      console.error("verifyAuthenticationResponse error", error);
      user.currentChallenge = undefined;
      return res.status(400).json({ ok: false, error: "verification failed" });
    }
  } catch (error) {
    console.error("authenticate/verify error", error);
    return res.status(500).json({ ok: false, error: "server error" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`webauthn server listening on http://localhost:${port}`);
});
