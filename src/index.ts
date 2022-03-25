import app from "./server";
import { getEnv } from "./enviroment";

getEnv();
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App started on ${port}`);
});