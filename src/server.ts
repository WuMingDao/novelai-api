import { app } from "./app.js";
import { naiContriller } from "./controllers/nai.js";

const port = process.env.PORT || 3000;

app.post("/nai", naiContriller);

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
