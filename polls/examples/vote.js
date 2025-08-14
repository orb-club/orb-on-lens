const { getVotePollParams, ACTIONS } = require("../rpc");

const POST =
  "76202132720529131208811116967817773363308580729828331951633739051231894313553";

const pollOptions = [1, 2]; // vote the second and third option,

const voteParams = getVotePollParams(pollOptions);

const variables = {
  request: {
    post: POST,
    action: {
      unknown: {
        address: ACTIONS.POLL,
        params: voteParams,
      },
    },
  },
};

// variables
//{
//    "request": {
//        "post": "76202132720529131208811116967817773363308580729828331951633739051231894313553",
//        "action": {
//        "unknown": {
//            "params": [
//            {
//                "key": "0x556afbd81021a38c884fb305b414139686e5b342bc8482734ca7d1d02ac92847",
//                "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
//            }
//            ],
//            "address": "0x0b9507487800f0c385a240199fdf1d79131e8e25"
//        }
//        }
//    }
//}
