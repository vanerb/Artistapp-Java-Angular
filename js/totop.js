$(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
        $('#btn-arriba').fadeIn();
    } else {
        $('#btn-arriba').fadeOut();
    }
});

$(document).ready(function () {
    

    $('#btn-arriba').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

});