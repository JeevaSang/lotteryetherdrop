let logOn = true;

function dbg(e) {
    if (logOn)
        console.log(e.toString());
}

BetClient = {

    web3Provider: null,

    contracts: {},

    jsonFile: '',

    raiseError: (err, tag) => {

        let message;

        if (!tag)
            tag = 'untagged';
        if (err) {
            if (err.msg) {
                message = err.msg;
            } else {
                message = err;
            }
        }
        if (BetClient.onError) {
            BetClient.onError(message, tag);
        }
        dbg(tag + ': [' + message + ']');
    },

    init: () => {
        return BetClient.initWeb3();
    },

    initWeb3: () => {
        /*if (typeof web3 !== 'undefined') {
            BetClient.web3Provider = web3.currentProvider;
        } else {
            if (BetClient.onNoDefaultWeb3Provider) {
                setTimeout(BetClient.onNoDefaultWeb3Provider, 3000);
            }
            let infura = 'https://mainnet.infura.io/plnAtKGtcoxBtY9UpS4b';
            BetClient.web3Provider = new Web3.providers.HttpProvider(infura);
        }
        else {*/
            console.log('ganache')
            BetClient.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
       // }
        web3 = new Web3(BetClient.web3Provider);
        return BetClient.initContract();
    },

    initContract: () => {
        dbg(`loading ${BetClient.jsonFile}`);
        $.getJSON(BetClient.jsonFile, (data) => {
            dbg('got abi');
            BetClient.contracts.EtherDrop = TruffleContract(data);
            BetClient.contracts.EtherDrop.setProvider(BetClient.web3Provider);
            BetClient.address = data.networks[5777].address;
            if (BetClient.onContractLoaded) {
                BetClient.onContractLoaded();
            }
            BetClient.listen();
        });
    },

    loadRoundInfo: () => {
        BetClient.contracts.EtherDrop
            .deployed()
            .then((instance) => {
                return instance.currentRound.call();
            })
            .then(function (result) {
                if (BetClient.onLoadRoundInfo)
                    BetClient.onLoadRoundInfo($.map(result, (r) => {
                        return r.toNumber();
                    }));
            })
            .catch((e) => BetClient.raiseError(e, 'loadRoundInfo'));
    },

    loadUserStats: (address) => {
        dbg(`getting profile: ${address}`);
        let contract;
        let rounds;
        let min = 0;

        let userRounds = (instance) => {
            dbg('getting user rounds');
            contract = instance;
            return contract.userRounds.call(address);
        };

        let fetchUserRounds = (size) => {
            rounds = size;
            dbg(`user has ${rounds} rounds`);
            if (rounds == 0) {
                BetClient.onLoadUserStat(null);
            } else {
                if (rounds > 5) min = rounds - 5;
                return queryNextRound();
            }
        };

        let queryNextRound = () => {
            if (!isNaN(rounds) && rounds - min > 0) {
                dbg(`querying user round: ${rounds}`);
                return contract.userRound.call(address, --rounds);
            }
        };

        let fetchRound = (result) => {
            if (result) {
                dbg(`got user round`);
                BetClient.onLoadUserStat($.map(result, (r) => {
                    return r.toNumber();
                }));
            }
        };

        BetClient.contracts.EtherDrop
            .deployed()
            .then(userRounds)
            .then(fetchUserRounds)
            .then(fetchRound)
            /* 2 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 3 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 4 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 5 */
            .then(queryNextRound)
            .then(fetchRound)
            /* catch */
            .catch((e) => BetClient.raiseError(e, 'loadUserStats'));
    },

    fetchTx: (address, round) => {
        BetClient.contracts.EtherDrop
            .deployed()
            .then((contract) => {
                contract.NewWinner({}, {fromBlock: 0, toBlock: 'latest'})
                    .get((err, result) => {
                            if (err) {
                                BetClient.raiseError(err, 'fetchTx');
                            } else if (BetClient.onTxFetch) {
                                if (result && result.length > 0) {
                                    for (let r = 0; r < result.length; r++) {
                                        if (result[r].args.addr == address &&
                                            result[r].args.round.toNumber() == round) {
                                            BetClient.onTxFetch(round, result[r].transactionHash);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    );
            }).catch((e) => BetClient.raiseError(e, 'fetchTx'));
    },

    fetchUsrTx: (address, round) => {
        BetClient.contracts.EtherDrop
            .deployed()
            .then((contract) => {
                dbg(`fetching user tx ${address}[${round}]`);
                contract.NewDropIn({}, {fromBlock: 0, toBlock: 'latest'})
                    .get((err, result) => {
                            if (err) {
                                BetClient.raiseError(err, 'fetchUsrTx');
                            } else if (BetClient.onUsrTxFetch) {
                                if (result && result.length > 0) {
                                    for (let r = 0; r < result.length; r++) {
                                        if (result[r].args.addr == address &&
                                            result[r].args.round.toNumber() == round) {
                                            BetClient.onUsrTxFetch(round, result[r].transactionHash);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    );
            })
            .catch((e) => BetClient.raiseError(e, 'fetchUsrTx'));
    },

    loadGlobalStats: () => {
        dbg(`getting global stats`);
        let contract;
        let rounds;
        let min = 0;
        let allRounds = (instance) => {
            dbg('getting all rounds');
            contract = instance;
            return contract._round.call();
        };
        let fetchRounds = (size) => {
            rounds = size;
            dbg(`contract has ${rounds} rounds`);
            if (rounds == 0) {
                if (BetClient.onLoadGlobalStat)
                    BetClient.onLoadGlobalStat(null);
            }
            else {
                if (rounds > 5) min = rounds - 5;
                return queryNextRound();
            }
        };
        let queryNextRound = () => {
            if (!isNaN(rounds) && rounds - min > 0) {
                dbg(`querying round stats: ${rounds}`);
                return contract.roundStats.call(--rounds);
            }
        };
        let fetchRound = (result) => {
            if (result) {
                dbg(`got round stat`);
                if (BetClient.onLoadGlobalStat) {
                    BetClient.onLoadGlobalStat($.map(result, (r) => {
                        if ((r + '').startsWith('0x')) {
                            return r;
                        } else {
                            return r.toNumber();
                        }
                    }));
                }
                return result;
            }
        };
        BetClient.contracts.EtherDrop
            .deployed()
            .then(allRounds)
            .then(fetchRounds)
            .then(fetchRound)
            /* 2 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 3 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 4 */
            .then(queryNextRound)
            .then(fetchRound)
            /* 5 */
            .then(queryNextRound)
            .then(fetchRound)
            /* catch */
            .catch((e) => BetClient.raiseError(e, 'loadGlobalStats'));
    },

    participate: (amount) => {
        web3.eth.getAccounts((error, accounts) => {
            if (error) {
                BetClient.raiseError(error, 'Participate');
            } else {
                dbg(`accounts: ${JSON.stringify(accounts)}`);
                if (accounts.length === 0) {
                    BetClient.raiseError('No Accounts', 'Participate');
                } else {
                    BetClient.contracts.EtherDrop
                        .deployed()
                        .then((instance) => {
                            return instance.sendTransaction({
                                from: accounts[0],
                                value: amount
                            }).then(function (result) {
                                dbg(JSON.stringify(result));
                            });
                        })
                        .catch((e) => BetClient.raiseError(e, 'Participate'));
                }
            }
        });
    },

    listen: () => {
        BetClient.contracts.EtherDrop
            .deployed()
            .then((instance) => {
                return instance;
            })
            .then((result) => {
                const options = {fromBlock: 'latest', toBlock: 'pending'};
                result.NewDropIn({}, options).watch(function (error, result) {
                    if (error)
                        BetClient.raiseError(error, 'NewDropIn');
                    else if (BetClient.onNewDropIn)
                        BetClient.onNewDropIn(result);
                });
                result.NewWinner({}, options).watch((error, result) => {
                    if (error)
                        BetClient.raiseError(error, 'NewWinner');
                    else if (BetClient.onNewWinner)
                        BetClient.onNewWinner(result);
                });
            })
            .catch((e) => BetClient.raiseError(e, 'listen'));
    }
};
