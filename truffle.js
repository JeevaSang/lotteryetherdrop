module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, 
	    gas: 20500000, // Current Ropsten gas limit. See https://ropsten.etherscan.io/block/3141628
      gasPrice: 1100000000, // 1.1 GWei - based on the lower end of current txs getting into blocks currently on Ropsten.
      network_id: "*"
    }
  }
};
