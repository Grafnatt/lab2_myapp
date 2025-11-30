$(document).ready(function() {

    /* === ВХОД === */

    // Показать окно входа
    $('#Login').click(function(e){
        e.preventDefault();
        $('#login_popup').addClass('active');
    });

    // Закрыть окно входа
    $('#login_popup_close').click(function() {
        $('#login_popup').removeClass('active');
    });

    // Отправка данных для входа
    $('#submit_login').click(function(e){
        e.preventDefault();

        const login_data = {
            login: $('#inpLogin').val(),
            password: $('#inpPassword').val()
        };

        $.post('/api/auth/login', login_data, function(response){
            if(response.msg === '') {
                window.location = "/";
            } else {
                alert(response.msg);
            }
        });
    });



    /* === СОЗДАНИЕ ЗАКАЗА === */

    // Открыть окно создания заказа
    $('#create_order_button').click(function(e){
        e.preventDefault();
        $('#order_popup').addClass('active');
    });

    // Закрыть окно создания заказа
    $('#order_popup_close, #cancel_order').click(function() {
        $('#order_popup').removeClass('active');
    });

    // Создать заказ
    $('#submit_order').click(function(e){
        e.preventDefault();

        const label = $('#inpOrderLabel').val();
        const client_id = $('#inpOrderClient').val();
        const amount = parseFloat($('#inpOrderAmount').val()).toFixed(2);

        $.post('/orders/create', { label, id_client: client_id, amount }, function(res){
            if(res.success){
                alert('Заказ создан!');
                location.reload();
            } else {
                alert('Ошибка: ' + res.msg);
            }
        });
    });

    // Закрытие окна создания заказа и очистка полей
    $('#order_popup_close, #cancel_order').click(function() {
        $('#order_popup').removeClass('active');
        $('#inpOrderLabel').val('');
        $('#inpOrderClient').val('');
        $('#inpOrderAmount').val('');
    });




    /* === ВЫХОД === */
    $('#Logout').click(function(e){
        e.preventDefault();

        $.post('/api/auth/logout', function(){
            window.location = "/";
        });
    });

});
