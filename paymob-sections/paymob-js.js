function update_two_hidden_fields() {
    var number = document.getElementById('number');
    var mmyy = document.getElementById('mmyy');
    var card_number = document.getElementById('card_number');
    var mm = document.getElementById('mm');
    var yy = document.getElementById('yy');

    if (number && card_number) {
        card_number.value = number.value.replace(/\s/g, '');
    }

    if (mmyy && mm && yy) {
        var expiry = mmyy.value.replace(/\s/g, '');
        var parts = expiry.split('/');
        if (parts.length === 2) {
            mm.value = parts[0];
            yy.value = parts[1];
        }
    }
}
