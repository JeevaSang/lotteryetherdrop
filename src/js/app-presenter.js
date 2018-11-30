AppPresenter = {

    coinSound: () => {
        document.getElementById("coin-sound").play();
    },

    newToast: (msg) => {
        AppPresenter.hideToasts();
        AppPresenter.toast(msg);
    },

    toast: (msg) => {
        AppPresenter._toast = M.toast({
            html: msg,
            classes: 'gray white-text rounded opacity-70'
        });
        return AppPresenter;
    },

    hideToasts: () => {
        M.Toast.dismissAll();
    },

    showProgress: () => {
        dbg('showing progress');
        $('#loader').show();
    },

    hideProgress: () => {
        dbg('hiding progress');
        $('#loader').hide();
    },

    showTrxProgress: () => {
        dbg('showing trx progress');
        $('#trx-progress').show();
        AppPresenter.disableParticipate();
        AppPresenter.selectUserStats();
    },

    disableParticipate: () => {
        $('#btn-participate').addClass('disabled');
    },

    enableParticipate: () => {
        $('#btn-participate').removeClass('disabled');
    },

    hideTrxProgress: () => {
        dbg('hiding trx progress');
        $('#trx-progress').hide();
        AppPresenter.enableParticipate();
    },

    showAddress: (address) => {
        $('#acc_address').val(address);
        $('#acc_label').addClass("active");
        return AppPresenter;
    },

    copyToClipboard: (text) => {
        let $temp = $("<input>");
        $("body").append($temp);
        $temp.val(text).select();
        document.execCommand("copy");
        $temp.remove();
    },

    welcomeGuest: () => {
        AppPresenter.toast(`
            <span style="opacity: 0.7">
                <b>Welcome</i> 
                <br><br> To Track Your Recent Stats<br>Set Your Ethereum Address &nbsp;<i style="vertical-align: middle" class="material-icons">face</i>
            </span>`
        );
    },

    selectUserStats: () => {
        $('#global_stats').removeClass('active');
        $('#my_stats').addClass('active');
    },

    showRoundDetails: (result) => {

        let round = result[0] + 1;
        let count = result[1];
        let drops = result[2];
        let price = result[3];

        $('#round-number').html(`&nbsp;# Round ${round}`);
        $('#draw-number').html(` Draw Number ${round}`);
        $('#round-drops').html(`${drops} Drops`);
        $('#round-pay-in').html(`${price / 1e18} ETH`);
        $('#or-send-amnt').html(`OR SEND ${price / 1e18} ETH`);
        $('#round-jackpot').html(`~ ${drops * price * 0.9 / 1e18} ETH`);
        $('#win-profit').html(`x${drops * 0.9}`);

        let progress = 150 * (drops - count) / drops;
        $('#round_progress').html(`${count} / ${drops}`);

        $.keyframe.define([{
            name: 'fillAction',
            '0%': {transform: 'translate(0, 150px)'},
            '100%': {transform: 'translate(0, ' + progress + 'px)'}
        }]);
    },

    clearUserStats: () => {
        $('#user_rounds').html('');
    },

    clearGlobalStats: () => {
        $('#global_rounds')
            .html(`<a href="https://etherscan.io/address/${BetClient.address}#internaltx"  class="collection-header" 
                        target="_blank" style="padding:0; text-align: center">
                            <b style="display: block;">EtherDrop On EtherScan</b>
                    </a>`);
    },

    showUserStat: (userStat) => {
        App.participated = App.round == userStat[0];
        if (App.participated) AppPresenter.showTrxProgress();

        let stat = App.participated ? 'Wait' : userStat[3] > 0 ? 'Won' : 'Lost';
        let bgd = App.participated ? 'orange' : userStat[3] > 0 ? 'blue' : 'red';

        $('#acc_address').val(App.address);

        $('#user_rounds').append(
            `<a id="usrRound${userStat[0]}" class="collection-item" target="_blank" href="javascript:void(0)">
                <b> Round ${userStat[0] + 1}</b>
                <span class="right new badge ${bgd} white-text-text"  style="min-width: 80px"
                        data-badge-caption="${stat} #${userStat[1] + 1}">
                </span>
             </a>`
        );

        AppPresenter.hideProgress();
    },

    showGlobalStat: (globalStat) => {
        $('#global_rounds').append(
            `<a id="round${globalStat[0]}" 
            href="javascript:AppPresenter.toast('   <b>Waiting For Transaction Fetch</b>')" 
            target="_blank" class="collection-item">
                <b>Round ${globalStat[0] + 1}</b> 
                <span class="right new badge blue white-text-text"
                    data-badge-caption="Winner #${globalStat[2] + 1}">   
                </span>
             </a>`
        );
    }
}
;