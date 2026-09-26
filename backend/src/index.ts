import express from "express"
import { ENV } from "./config/env";
import { clerkMiddleware } from '@clerk/express'
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import wordRoutes from "./routes/wordRoutes";
import wordStateRoutes from "./routes/wordStateRoutes";

const app = express();

app.use(cors({
  origin: ENV.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(clerkMiddleware()); //auth object will be attched to the req
app.use(express.json()); // parses JSON request bodies.
app.use(express.urlencoded({ extended: true })); // parses form data (like HTML forms). 


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the vocabulary learning app',
    endpoints: {
      words: '/api/words',
      randomWord: '/api/words/random',
      health: '/health',
    },
  });
});

// Kelime Uygulaması Rotaları
app.use("/api/users", userRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/word-states", wordStateRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});