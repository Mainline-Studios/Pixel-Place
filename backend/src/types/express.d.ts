declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
    }

    interface Request {
      /** Raw body buffer for Stripe webhook signature verification */
      rawBody?: Buffer;
    }
  }
}

export {};
