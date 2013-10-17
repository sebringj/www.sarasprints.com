/*if (location.hostname !== 'demo.hubsoft.ws') {
    location = '//demo.hubsoft.ws/demo/products.htm';
}*/    ////////Not sure if we need this later -Adrian

// config
hubsoft.clientid = 'klim';
hubsoft.thumbNailImageIndex = 6;
hubsoft.detailImageIndex = 0;
hubsoft.global = { googleAnalytics: '' };
hubsoft.page = { messsages: {} };

hubsoft.cart.updateUI(function () {
    var cartCount = hubsoft.cart.itemCount();
    if (cartCount > 0) {
        $('#cartStatus').find('.count').text(cartCount);
        $('#cartStatusLi').show();
    } else {
        $('#cartStatusLi').hide();
    }
});
hubsoft.cart.triggerUpdateUI();

hubsoft.handleLoginState = function () {
    $('.loggedin,.loggedout').hide();
    if (emeraldcode.isLoggedIn()) {
        if (sessionStorage['username']) {
            $('.loggedin').find('a .username').text(sessionStorage['username']).end().show();
        }
        $('.loggedin.signoutlink').show();
    } else {
        $('.loggedout').show();
    }
};
hubsoft.handleLoginState();

jQuery(function () {
    $('.signoutlink a').click(function (ev) {
        ev.preventDefault();
        delete sessionStorage['username'];
        hubsoft.logout(function (data) {
            window.location = './products.htm';
        });
    });
});