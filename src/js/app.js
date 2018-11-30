App = {

    isUsingTrustWallet: () => {
        return null != navigator.userAgent.match(/Trust/i);
    },

    isUsingMobileDevice: () => {
        return null != (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/Samsung/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        );
    },

    redirectTrustWallet: () => {
        window.location.replace('https://links.trustwalletapp.com/nVUoIES31O');
    },

    checkUser: () => {
        let address = Cookies.get('address');
        if (address) {
            App.address = address;
            AppPresenter.showAddress(address);
            return true;
        } else {
            return false;
        }
    },

    bindButtons: () => {
        $('#btn-copy-address').click(() => {
            let address = BetClient.contracts.EtherDrop.address;
            AppPresenter.copyToClipboard(address);
            AppPresenter.toast('Drop Address copied to clipboard!');
        });
        $('#btn-participate').click(() => {
            AppPresenter.showTrxProgress();
            BetClient.participate(App.pricing);
        });
        $("#acc_address").keyup(function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                event.preventDefault();
                $('#btn-profile').click();
                return false;
            }
        });
        $('#btn-profile').click(function () {
            AppPresenter.showProgress();
            App.address = $('#acc_address').val();
            Cookies.set('address', App.address);
            $('#user_rounds').empty();
            BetClient.loadUserStats(App.address);
        });
    }
};

$(() => {

    M.AutoInit();

    AppInit.navScroll().bannerClose().blockAnimation().disableZoom().timeoutPulse();

    App.bindButtons();

    App.checkUser();

    BetClient.onError = (error, tag) => {

        if (tag == 'NewWinner') {

        }

        if (tag == 'NewDropIn') {
            if (error == 'Error: Invalid JSON RPC response: ""') {
                AppPresenter.newToast(`Please Use a Web3JS Browser or Check MetaMask`);
            }
        }

        if (tag == 'Participate') {
            if (error) {
                if (error == 'No Accounts') {
                    AppPresenter.newToast(`Please Use a Web3JS Browser or Check MetaMask`);
                }
                else if (error.message == 'Error: transaction underpriced') {
                    AppPresenter.toast('Invalid Amount');
                }
                else if (error.message == "Error: MetaMask Tx Signature: User denied transaction signature.") {
                    AppPresenter.toast('Transaction Declined');
                }
                AppPresenter.hideTrxProgress();
            }
            else {
                AppPresenter.toast('Error Occurred, Try Reloading The Page');
            }
        }


        AppPresenter.hideProgress();
    };

    BetClient.onNoDefaultWeb3Provider = () => {
        if (App.isUsingMobileDevice() && !App.isUsingTrustWallet()) {
            setTimeout(() => {
                AppPresenter.hideToasts();
                AppPresenter.toast(`<span>Please Use A Web3 Supported Browser</span>`);
                AppPresenter.toast(`<span>Use TrustWallet?</span>
                <button onclick="App.redirectTrustWallet()" class="btn-flat toast-action">
                    Try It
                </button>`
                );
            }, 1000)
        }
    };

    BetClient.onContractLoaded = () => {
        if (App.address) {
            AppPresenter.toast("<span style='opacity: 0.5'>Welcome &nbsp; <i class='fa fa-smile'></i></span>");
        } else {
            AppPresenter.welcomeGuest();
        }
        AppPresenter.showProgress();
        BetClient.loadRoundInfo();
        dbg(`contract address: ${BetClient.address}`);
        AppPresenter.clearGlobalStats();
        BetClient.loadGlobalStats();
    };

    BetClient.onLoadRoundInfo = function (result) {

        if (result) {
            App.round = result[0];
            App.pricing = result[3];
            AppPresenter.showRoundDetails(result);
        }

        AppPresenter.hideProgress();

        if (App.address) {
            AppPresenter.clearUserStats();
            BetClient.loadUserStats(App.address);
        }
    };

    BetClient.onLoadUserStat = (stat) => {
        dbg(`got user stat ${JSON.stringify(stat)}`);
        if (stat != null) {
            AppPresenter.showUserStat(stat);
            BetClient.fetchUsrTx(App.address, stat[0]);
        }
    };

    BetClient.onUsrTxFetch = (round, hash) => {
        dbg(`got user tx ${hash}`);
        $(`#usrRound${round}`).attr('href', `https://etherscan.io/tx/${hash}`);
    };

    BetClient.onLoadGlobalStat = (stat) => {
        dbg(`got global stat ${JSON.stringify(stat)}`);
        if (stat != null) {
            AppPresenter.showGlobalStat(stat);
            BetClient.fetchTx(stat[1], stat[0]);
        }
    };

    BetClient.onTxFetch = (round, hash) => {
        $(`#round${round}`).attr('href', `https://etherscan.io/tx/${hash}`);
    };

    let upper = (x) => {
        return (x + '').toUpperCase();
    };

    BetClient.onNewDropIn = (result) => {

        dbg('new drop');

        function isNewDrop(result) {
            let lastDropBlock = Cookies.get('dropBlock');
            let lastDropIndex = Cookies.get('dropIndex');
            if (!lastDropBlock || !lastDropIndex) {
                Cookies.set('dropIndex', result.logIndex);
                Cookies.set('dropBlock', result.blockNumber);
                return true;
            }
            if (lastDropBlock < result.blockNumber ||
                (lastDropBlock == result.blockNumber && lastDropIndex < result.logIndex)) {
                Cookies.set('dropIndex', result.logIndex);
                Cookies.set('dropBlock', result.blockNumber);
                return true;
            }
            return false;
        }

        if (isNewDrop(result)) {
            dbg('new participant');
            BetClient.loadRoundInfo();
            AppPresenter.coinSound();
            AppPresenter.toast("<span style='opacity: 0.5'>New Subscriber&nbsp; <i class='fa fa-coins'></i></span>");
            if (upper(result.args.address) == upper(App.address)) {
                AppPresenter.hideTrxProgress();
            }
        }
    };

    BetClient.onNewWinner = (result) => {

        dbg('new winner');

        function isNewWin(result) {
            let lastBlock = Cookies.get('winBlock');
            let lastIndex = Cookies.get('winIndex');
            if (!lastBlock || !lastIndex) {
                Cookies.set('winIndex', result.logIndex);
                Cookies.set('winBlock', result.blockNumber);
                return true;
            }
            if (lastBlock < result.blockNumber ||
                (lastBlock == result.blockNumber && lastIndex < result.logIndex)) {
                Cookies.set('winIndex', result.logIndex);
                Cookies.set('winBlock', result.blockNumber);
                return true;
            }
            return false;
        }

        if (isNewWin(result)) {
            dbg('new winner');
            AppPresenter.clearGlobalStats();
            BetClient.loadGlobalStats();
        }
    };

    BetClient.init();
});