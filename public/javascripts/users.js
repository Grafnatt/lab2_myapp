$(document).ready(function(){
        loadUsers();
    
    // Делегирование событий для форм редактирования
    $(document).on('submit', 'form[action^="/users/edit/"]', function(e) {
        e.preventDefault();
        const form = $(this);
        $.post(form.attr('action'), form.serialize(), function() {
            loadUsers(); // Перезагрузить таблицу
        });
    });
    
    
    // Делегирование для удаления
    $(document).on('submit', 'form[action^="/users/delete/"]', function(e) {
        if (!confirm('Удалить пользователя?')) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        const form = $(this);
        $.post(form.attr('action'), form.serialize(), function() {
            loadUsers(); // Перезагрузить таблицу
        });
    });
});

function loadUsers() {
    $('#tbl_users tbody').empty();
    $.ajax({
        type: 'GET',
        url: '/api/users',
        dataType: 'JSON'
    }).done(function(response) {
        response.users.forEach(user => {
            $('#tbl_users tbody').append(
                `<tr>
                    <td>${user.id}</td>
                    <td>${user.fio}</td>
                    <td>${user.login}</td>
                    <td>${user.role_label}</td>
                    <td>
                        <!-- Быстрое редактирование ФИО -->
                        <form action="/users/edit/${user.id}" method="POST" style="display:inline">
                            <input type="hidden" name="login" value="${user.login}">
                            <input type="hidden" name="id_role" value="${user.id_role}">
                            <input type="text" name="fio" value="${user.fio || ''}" size="10" placeholder="ФИО">
                            <button type="submit">✏️</button>
                        </form>
    
                        <!-- Редактирование логина и роли -->
                        <form action="/users/edit/${user.id}" method="POST" style="display:inline; margin-left: 5px">
                            <input type="text" name="login" value="${user.login}" size="8">
                            <select name="id_role">
                            <option value="1" ${user.id_role == 1 ? 'selected' : ''}>A</option>
                            <option value="2" ${user.id_role == 2 ? 'selected' : ''}>R</option>
                            <option value="3" ${user.id_role == 3 ? 'selected' : ''}>S</option>
                        </select>
                        <button type="submit">👤</button>
                        </form>
    
    <!-- Смена пароля -->
                        <form action="/users/changepass/${user.id}" method="POST" style="display:inline; margin-left: 5px">
                            <input type="hidden" name="id_role" value="${user.id_role}">    
                            <input type="password" name="pass" placeholder="Пароль" size="8">
                        <button type="submit">🔑</button>
                        </form>
    
    <!-- Удаление -->
    <form action="/users/delete/${user.id}" method="POST" style="display:inline; margin-left: 5px">
        <button type="submit" onclick="return confirm('Удалить?')">🗑️</button>
    </form>
                    </td>
                </tr>`
            );
        });
    }).fail(function(xhr, status, error) {
        console.error('Ошибка загрузки пользователей:', error);
        $('#tbl_users tbody').append(
            `<tr><td colspan="5" style="color: red">Ошибка загрузки данных</td></tr>`
        );
    });
};
