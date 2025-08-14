const { encodeAbiParameters, getContract } = require("viem");
const POLL_ABI = require("./abis/OrbPollVoteAction.json");
const { getPublicClient } = require("./clients");

// set constants. note you have to define the RPC correctly also in client.js
const ACTIONS = {
  POLL:
    process.env.POLL_ADDRESS || "0x0B9507487800F0c385A240199fDf1d79131E8e25",
};

const FEED =
  process.env.DEFAULT_LENS_FEED || "0xcB5E109FFC0E15565082d78E68dDDf2573703580";

const CHAIN_ID = process.env.LENS_CHAIN_ID || 232;
const publicClient = getPublicClient(CHAIN_ID);

// keccac256 encoded params
const PARAM__OPTIONS =
  "0xb3b07c7b034d83c7460539ad9d5ba833df459b4462b7320af957655e85eadd2e"; // keccak256("lens.param.options");
const PARAM__END_TIMESTAMP =
  "0xe2a4a768f409ba480a321a7d36ec9da16e9eae60a25bb0aeccf334822cc859a8"; // keccak256("lens.param.endTimestamp");
const PARAM__ALLOW_MULTIPLE_ANSWERS =
  "0x493c15636df8cb2a8e0e99f24b8974bb83106ca6fe37fe24eab2d679fed5ebb3"; // keccak256("lens.param.allowMultipleAnswers");
const PARAM__VOTE_OPTION =
  "0x556afbd81021a38c884fb305b414139686e5b342bc8482734ca7d1d02ac92847"; // keccak256("lens.param.voteOptions");

/**
 * Get poll parameters for creating a new poll
 * @param {Object} poll - Poll object containing endTimestamp, allowMultipleAnswers, and questions
 * @param {number} poll.endTimestamp - End timestamp for the poll
 * @param {boolean} poll.allowMultipleAnswers - Whether multiple answers are allowed
 * @param {string[]} poll.questions - Array of poll questions/options
 * @returns {Array} Array of poll parameters with encoded data and keys
 */
function getPollParams(poll) {
  const params = [
    {
      raw: {
        data: encodeAbiParameters([{ type: "uint72" }], [poll.endTimestamp]),
        key: PARAM__END_TIMESTAMP,
      },
    },
    {
      raw: {
        data: encodeAbiParameters(
          [{ type: "bool" }],
          [poll.allowMultipleAnswers]
        ),
        key: PARAM__ALLOW_MULTIPLE_ANSWERS,
      },
    },
    {
      raw: {
        data: encodeAbiParameters([{ type: "string[]" }], [poll.questions]),
        key: PARAM__OPTIONS,
      },
    },
  ];

  return params;
}

/**
 * Get poll options for a specific post
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @returns {Promise<string[]>} Array of poll options
 */
async function getOptions({ feed, postId }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const options = await contract.read.getOptions([feed, postId]);
    return options;
  } catch (error) {
    console.error("Error getting poll options:", error);
    return [];
  }
}

/**
 * Get vote counts for each option in a poll
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @returns {Promise<number[]>} Array of vote counts for each option
 */
async function getVoteCounts({ feed, postId }) {
  try {
    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const voteCounts = await contract.read.getVoteCounts([feed, postId]);
    return voteCounts.map((count) => Number(count));
  } catch (error) {
    console.error("Error getting vote counts:", error);
    return [];
  }
}

/**
 * Get when the poll ends
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @returns {Promise<number>} End timestamp
 */
async function getPollEndTimestamp({ feed, postId }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const endTimestamp = await contract.read.getPollEndTimestamp([
      feed,
      postId,
    ]);
    return Number(endTimestamp);
  } catch (error) {
    console.error("Error getting poll end timestamp:", error);
    return 0;
  }
}

/**
 * Get what a specific voter voted for (single choice polls)
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @param {string} voter - Voter address
 * @returns {Promise<number>} Voted option index (0-based)
 */
async function getVotedOption({ feed, postId, voter }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const votedOption = await contract.read.getVotedOption([
      feed,
      postId,
      voter,
    ]);
    return Number(votedOption);
  } catch (error) {
    console.error("Error getting voted option:", error);
    return null; // -1 indicates no vote or error
  }
}

/**
 * Check if a voter has voted
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @param {string} voter - Voter address
 * @returns {Promise<boolean>} True if voter has voted
 */
async function hasVoted({ feed, postId, voter }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const hasVotedResult = await contract.read.hasVoted([feed, postId, voter]);
    return hasVotedResult;
  } catch (error) {
    console.error("Error checking if voter has voted:", error);
    return false;
  }
}

/**
 * Get all options a voter voted for (for multiple choice polls)
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @param {string} voter - Voter address
 * @returns {Promise<boolean[]>} Array of booleans indicating which options were voted for
 */
async function getVotedOptions({
  feed,
  postId,
  voter,
  isAllowMultipleAnswers,
}) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    let votedOptions = [];
    if (isAllowMultipleAnswers) {
      votedOptions = await contract.read.getVotedOptions([feed, postId, voter]);
    } else {
      const votedOption = await contract.read.getVotedOption([
        feed,
        postId,
        voter,
      ]);
      if (votedOption === 0) {
        votedOptions = [true];
      } else if (votedOption === 1) {
        votedOptions = [false, true];
      } else if (votedOption === 2) {
        votedOptions = [false, false, true];
      } else if (votedOption === 3) {
        votedOptions = [false, false, false, true];
      } else if (votedOption === 4) {
        votedOptions = [false, false, false, false, true];
      }
    }
    return votedOptions;
  } catch (error) {
    console.error("Error getting voted options:", error);
    return [];
  }
}

/**
 * Check if a voter voted for a specific option
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @param {string} voter - Voter address
 * @param {number} optionIndex - Option index to check
 * @returns {Promise<boolean>} True if voter voted for the specified option
 */
async function hasVotedForOption({ feed, postId, voter, optionIndex }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const hasVotedForOptionResult = await contract.read.hasVotedForOption([
      feed,
      postId,
      voter,
      optionIndex,
    ]);
    return hasVotedForOptionResult;
  } catch (error) {
    console.error("Error checking if voter voted for option:", error);
    return false;
  }
}

/**
 * Check if multiple answers are allowed for the poll
 * @param {string} feed - Feed address
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if multiple answers are allowed
 */
async function getAllowMultipleAnswers({ feed, postId }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    const allowMultipleAnswers = await contract.read.getAllowMultipleAnswers([
      feed,
      postId,
    ]);
    return allowMultipleAnswers;
  } catch (error) {
    console.error("Error getting allow multiple answers:", error);
    return false;
  }
}

/**
 * Get poll voting events for a specific post
 * @param {string} postId - Post ID
 * @param {string} feed - Feed address (optional)
 * @param {number} fromBlock - Starting block number (optional)
 * @param {number} toBlock - Ending block number (optional)
 * @returns {Promise<Array>} Array of voting events with voter, postId, optionIndices, and timestamp
 */
async function getPollVotingEvents({ postId, feed, fromBlock, toBlock }) {
  try {
    if (!feed) {
      feed = FEED;
    }

    const contract = getContract({
      address: ACTIONS.POLL,
      abi: POLL_ABI,
      client: publicClient,
    });

    // Get events for the specific postId
    const events = await publicClient.getLogs({
      address: ACTIONS.POLL,
      event: {
        type: "event",
        name: "PollVoted",
        inputs: [
          {
            name: "voter",
            type: "address",
            indexed: true,
          },
          {
            name: "postId",
            type: "uint256",
            indexed: true,
          },
          {
            name: "optionIndices",
            type: "uint8[]",
            indexed: false,
          },
        ],
      },
      args: {
        postId: BigInt(postId),
      },
      fromBlock: fromBlock ? BigInt(fromBlock) : undefined,
      toBlock: toBlock ? BigInt(toBlock) : undefined,
    });

    // Transform events to include block timestamp
    const eventsWithTimestamp = await Promise.all(
      events.map(async (event) => {
        const block = await publicClient.getBlock({
          blockNumber: event.blockNumber,
        });

        return {
          voter: event.args.voter,
          postId: event.args.postId.toString(),
          optionIndices: event.args.optionIndices.map(Number),
          blockNumber: Number(event.blockNumber),
          blockTimestamp: Number(block.timestamp),
          transactionHash: event.transactionHash,
          logIndex: event.logIndex,
        };
      })
    );

    return eventsWithTimestamp;
  } catch (error) {
    console.error("Error getting poll voting events:", error);
    return [];
  }
}

/**
 * Get comprehensive poll data for a specific post
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Complete poll data
 */
async function getPoll({ postId, feed, myAddress }) {
  try {
    // For now, we need feed address - this might need to be passed or derived
    // You may need to adjust this based on how you get the feed address
    if (!feed) {
      feed = FEED;
    }

    const allowMultipleAnswers = await getAllowMultipleAnswers({
      feed,
      postId,
    });

    const [options, voteCounts, endTimestamp, myVotes] = await Promise.all([
      getOptions({ feed, postId }),
      getVoteCounts({ feed, postId }),
      getPollEndTimestamp({ feed, postId }),
      myAddress
        ? getVotedOptions({
            feed,
            postId,
            voter: myAddress,
            isAllowMultipleAnswers: allowMultipleAnswers,
          })
        : [],
    ]);

    const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0) || 0;

    let pollOptions = [];
    options.forEach((option, index) => {
      const opt = {
        option: option,
        voteCount: voteCounts[index],
        votePercentage:
          totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : null,
        myVote: myVotes.length > 0 ? myVotes[index] : null,
        voters: voteCounts[index] > 0 ? [] : null,
      };
      pollOptions.push(opt);
    });

    const pollResponse = {
      options: pollOptions,
      endTimestamp: endTimestamp,
      allowMultipleAnswers: allowMultipleAnswers,
      // totalVotes: totalVotes,
      isActive: Date.now() / 1000 < endTimestamp,
    };
    return pollResponse;
  } catch (error) {
    console.error("Error getting poll data:", error);
    return null;
  }
}

/**
 * Check if a post contains a poll action
 * @param {Object} post - Post object to check
 * @param {Array} post.actions - Array of post actions
 * @returns {boolean} True if post contains a poll action
 */
function postIsPoll(post) {
  if (!post || !post.actions) {
    return false;
  }

  for (const action of post.actions) {
    if (action?.__typename === "UnknownPostAction") {
      // TODO change to multiples
      if (action?.address?.toLowerCase() === ACTIONS.POLL) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get vote parameters for voting on a poll
 * @param {number[]} pollOptions - Array of option indices to vote for (0-based)
 * @returns {Array} Array of vote parameters with encoded data and key
 * @throws {Error} If pollOptions is not a valid array
 */
function getVotePollParams(pollOptions) {
  // pollOptions should be an array of option indices (0-based)
  // For single choice: [0] or [1] etc.
  // For multiple choice: [0, 2, 3] etc.

  if (!Array.isArray(pollOptions) || pollOptions.length === 0) {
    throw new Error("pollOptions must be a non-empty array of option indices");
  }

  return [
    {
      key: PARAM__VOTE_OPTION,
      data: encodeAbiParameters([{ type: "uint8[]" }], [pollOptions]),
    },
  ];
}

module.exports = {
  getPollParams, // getPollParams is used to get poll parameters for creating a new poll
  getOptions,
  getVoteCounts,
  getPollEndTimestamp,
  getVotedOption,
  hasVoted,
  getVotedOptions,
  hasVotedForOption,
  getAllowMultipleAnswers,
  getPoll, // getPoll is used to get poll data for a specific post
  getPollVotingEvents, // getPollVotingEvents is used to get poll voting events for a specific post
  postIsPoll, // postIsPoll is used to check if a post contains a poll action
  getVotePollParams, // getVotePollParams is used to get vote parameters for voting on a poll
  ACTIONS, // ACTIONS is used to get the address of the poll contract
};
