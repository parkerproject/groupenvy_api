(function () {

  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }



  document.querySelector('.js-submit').addEventListener('click', function (e) {
    var emailVal = document.querySelector('input[type=email]').value;
    var errorEl = $('.error');

    if (validateEmail(emailVal)) {

      $.post("/email/send", {
        email: emailVal
      }, function (result) {
        errorEl.text(result);
        $('.error').addClass('success').removeClass('error');
      });

    } else {
      errorEl.text('Please enter valid email');

    }

  });

})();