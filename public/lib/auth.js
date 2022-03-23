module.exports = {
    isOwner:function(request, response) {
        if (request.user) {
            return true;
        } else {
            return false;
        }
    },
    statusUI:function(request, response) {
        var authStatusUI = '<a href="/Login" class="btn btn-info btn-outline-success" role="button">로그인</a>'
        if (this.isOwner(request, response)) {
            authStatusUI = `${request.user.닉네임} | <a href="/Logout" class="btn btn-info btn-outline-success" role="button">로그아웃</a>`;
        }
        return authStatusUI;
    }
}