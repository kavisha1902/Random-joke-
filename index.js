import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("index.ejs", { joke: null, user: "Guest" });
});

app.post('/', async (req, res) => {
  let url = 'https://v2.jokeapi.dev/joke/';
  let categories = req.body.categories || "Any";
  if (Array.isArray(categories)) {
    url += categories.join(',');
  } else {
    url += categories;
  }

  const params = [];
  if (req.body.language) params.push(`lang=${req.body.language}`);

  // Handle type: only add if one type is selected
  if (req.body.type) {
    if (Array.isArray(req.body.type)) {
      if (req.body.type.length === 1) {
        params.push(`type=${req.body.type[0]}`);
      }
      // If both types are selected, don't add type param
    } else {
      params.push(`type=${req.body.type}`);
    }
  }

  if (req.body.amount) params.push(`amount=${req.body.amount}`);

  if (req.body.flags) {
    const blacklist = Array.isArray(req.body.flags) ? req.body.flags.join(',') : req.body.flags;
    params.push(`blacklistFlags=${blacklist}`);
  }

  if (params.length) url += "?" + params.join("&");

  try {
    const response = await axios.get(url);
    let jokeText = "";
    const jokeData = response.data;

    if (jokeData.type === "single") {
      jokeText = jokeData.joke;
    } else if (jokeData.type === "twopart") {
      jokeText = `${jokeData.setup}<br>${jokeData.delivery}`;
    } else if (jokeData.jokes && jokeData.jokes.length > 0) {
      jokeText = jokeData.jokes.map(j =>
        j.type === "single" ? j.joke : `${j.setup}<br>${j.delivery}`
      ).join("<hr>");
    } else {
      jokeText = "No joke found!";
    }

    res.render("index.ejs", { joke: jokeText, user: "Guest" });
  } catch (error) {
    res.render("index.ejs", { joke: "Couldn't fetch a joke right now.", user: "Guest" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});