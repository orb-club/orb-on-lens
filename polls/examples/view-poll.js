const { getPoll } = require("../rpc");

const POST =
  "76202132720529131208811116967817773363308580729828331951633739051231894313553";

async function main() {
  const poll = await getPoll({
    postId: POST,
    // feed: FEED, // set correct feed here or use default
    myAddress: null, // check user already voted
  });
  console.log(poll);
}

main();
