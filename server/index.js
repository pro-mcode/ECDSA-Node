const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0447f99ad8047049942ede9d4a35883c6cad11324e9d138c3669ee31e05daa3f66e36a3044842dd5dec28f5d14b4b6c22e1881b8f3ca579eb42c021ca4b168c803": 100,
  "0496d0858b6bb313f4c7888de278b501f89636416580a3372a159de3377bf188d563e06cdec0fb3d3607b334a65c50c22d461be7f1e718e30a76bf0933b133cbb1": 50,
  "048a005031632c5ee52101aad2a5bd5d28eefb5883e2c56050e1be49cd0f6e53a086170075fe471ca3045ac74466dd113bb29e65eaa45f8f3cc11b5df8afc1bace": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
