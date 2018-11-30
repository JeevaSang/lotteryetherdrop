AppInit = {

    navScroll: () => {
        let navbar = $("#navbar-container");
        let cards = $('#cards-container');
        let sticky = navbar.position().top;
        window.onscroll = () => {
            if (window.pageYOffset > sticky) {
                navbar.addClass("sticky navbar-fixed");
                cards.css('margin-top', '128px');
            } else {
                navbar.removeClass("sticky navbar-fixed");
                cards.css('margin-top', '64px');
            }
        };
        $('html, body').animate({
            scrollTop: navbar.position().top + 1
        });
        return AppInit;
    },

    blockAnimation: () => {
        let bx = 0;
        let bHash = $('#block_hash');
        let blockHashText = [
            '<i class="fa fa-fw fa-square"></i>',
            '<i class="fa fa-fw fa-ellipsis-h" ></i>',
            '<i class="fa fa-fw fa-square" ></i>',
            '<i class="fa fa-fw fa-ellipsis-h" ></i>',
            '<i class="fa fa-fw fa-square" ></i>',
            '<i class="fa fa-fw fa-ellipsis-h" ></i>',
            '<i class="fa fa-fw fa-square" ></i>',
            '<i class="fa fa-fw fa-ellipsis-h" ></i>',
            '<i class="fa fa-fw fa-tint" ></i>'
        ];

        let animateBlocks = () => {
            let e = $(blockHashText[bx++]);
            if (!e)
                return; // when the banner is removed
            e.hide();
            bHash.append(e);
            e.fadeIn(250);
            if (bx === blockHashText.length + 1) {
                bHash.html(blockHashText[0]);
                bx = 1;
            }
            setTimeout(animateBlocks, 500);
        };

        animateBlocks();

        return AppInit;
    },

    bannerClose: () => {

        $('#close-banner').click(() => {
            $('#intro-container').fadeOut(300, function () {
                $(this).empty().show();
            });
        });

        return AppInit;
    },

    disableZoom: () => {
        $(document).keydown((event) => {
            if (event.ctrlKey === true && (event.which === 61
                || event.which === 107
                || event.which === 173
                || event.which === 109
                || event.which === 187
                || event.which === 189)) {
                event.preventDefault();
            }
        });
        $(window).bind('mousewheel DOMMouseScroll', (event) => {
            if (event.ctrlKey === true) {
                event.preventDefault();
            }
        });

        return AppInit;
    },

    timeoutPulse: () => {
        setTimeout(() => {
            $('#floating-pulse').removeClass('pulse');
        }, 7000);
    }
};