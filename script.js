document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if(username === 'admin' && password === '123456') {
        window.location.href = 'frame.html'; // 账号密码正确，跳转至index.html
    } else {
        document.getElementById('error-message').style.display = 'block'; // 显示错误信息
    }
});